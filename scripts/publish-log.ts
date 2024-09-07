/**
 * @description 向CR群组发布新版本通知
 */

import Git, { LogResult } from 'simple-git';
import Contributors from '../meta/contributors.json';
import { VERSION_NOTIFY_URL } from '../meta/constants';

const git = Git({ maxConcurrentProcesses: 5 });

async function getLatestTags() {
  // 获取所有的tag并按时间排序，返回最新的两个tag
  const tags = await git.tags({ '--sort': '-creatordate' });

  const latestTags = tags.all.slice(0, 2);

  return latestTags;
}

async function getLogsForRecentTags() {
  const [latestTag, previousTag] = await getLatestTags();
  // 获取两个tag之间的提交日志
  const logs = await git.log({ from: previousTag, to: latestTag });

  return logs.all;
}

function extractLogDetails(logs: LogResult['all']) {
  // 更新人
  let author = '';
  // 更新内容
  const updates: string[] = [];
  // 更新版本信息
  const versions: { version: string; name: string }[] = [];

  for (let i = 0; i < logs.length; i += 1) {
    const { message, author_name: authorName } = logs[i];

    if (/^Merge branch/.test(message)) {
      //
    } else if (/^release/.test(message)) {
      const matcher = /^release:\s*(@\w+\/\w+-\w+)\s*(v\d+\.\d+\.\d+)/;

      const [, name = '', version = ''] = message.match(matcher) || [];

      versions.push({ version, name });

      !author && (author = Contributors.mapping[authorName] || authorName);
    } else {
      updates.push(message);
    }
  }

  return { author, updates, versions };
}

export async function publishMessage() {
  const logs = await getLogsForRecentTags();

  const { versions, updates, author } = extractLogDetails(logs);

  const headers = { 'Content-Type': 'application/json' };

  const data = JSON.stringify({ versions, updates, author });

  fetch(VERSION_NOTIFY_URL, { method: 'POST', headers, body: data });
}
