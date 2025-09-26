<template>
  <div>
    <router-view />
  </div>
</template>
<style lang="scss">
  .flex {
    display: flex;
    align-items: center;
  }
  .flexe {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .flexc {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .flexa {
    display: flex;
    align-items: flex-start;
  }
  .flexs {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .flexw {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
</style>
