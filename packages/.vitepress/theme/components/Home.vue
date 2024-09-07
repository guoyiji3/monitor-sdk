<template>
  <div mt-4 flex flex-col items-center>
    <div class="vp-doc">
      <h2 op50 font-normal pt-5 pb-2>感谢所有贡献者</h2>
    </div>

    <div grid="~ sm:cols-2 md:cols-3 lg:cols-4 gap-x-10 gap-y-20 items-center" p-4>
      <ContributorCard v-for="item in contributors" :key="item.name" :contributor="item" />

      <ContributorCard v-for="item in participants" :key="item.name" :contributor="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContributorInfo } from '../../../../scripts/changelog';
// @ts-expect-error missing types
import contributors from 'virtual:contributors';
import ContributorCard from './ContributorCard.vue';

const participants: ContributorInfo[] = [
  { name: '车文宇', count: 0, mail: 'chewy@91160.com', post: 'UI设计师' },
  { name: '黄佳浩', count: 0, mail: 'huangjh@91160.com', post: '测试工程师' }
];
</script>

<style lang="less"></style>
