/**
 * @description 通过获取 Git 提交记录，获取贡献者信息
 */

import Git from 'simple-git';

const git = Git({ maxConcurrentProcesses: 200 });

export interface ContributorInfo {
  // 贡献者
  name: string;
  // 提交次数
  count: number;
  // 邮箱
  mail: string;
  // 岗位
  post?: string;
}

async function getContributorsAt() {
  // 生成
  const map: Record<string, ContributorInfo> = {};

  const commands = ['log', '--pretty=format:"%an|%ae"'];

  try {
    // 获取修改文件历史
    const list = (await git.raw(commands)).split('\n').map((i) => i.slice(1, -1).split('|') as [string, string]);

    list
      .filter((i) => i[1])
      .forEach((i) => {
        !map[i[1]] && (map[i[1]] = { name: i[0], count: 0, mail: i[1] });

        map[i[1]].count += 1;
      });

    return Object.values(map).sort((a, b) => b.count - a.count);
  } catch (e) {
    return [];
  }
}

export async function getContributors(): Promise<ContributorInfo[]> {
  const result = await getContributorsAt();

  return result;
}
