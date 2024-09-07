<template>
  <div flex="~" item="center" gap-5>
    <img :src="withBase(`/users/${picture[contributor.name] || contributor.name}.webp`)" w-20 h-20 rounded-full />

    <div>
      <div text-xl mt-2 mb-1 text-base font-semibold>
        {{ mapping[contributor.name] || contributor.name }}
      </div>

      <div mt-2>
        {{ contributor.post || post[contributor.name] || 'web前端开发工程师' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress';
import { mapping, picture, post } from '../../../../meta/contributors.json';
import type { ContributorInfo } from '../../../../scripts/changelog';

interface Props {
  contributor: ContributorInfo;
}

const props = withDefaults(defineProps<Props>(), {});
</script>

<style lang="less"></style>
