<template>
  <div style="max-width: 250px">
    <div>You don’t have access to this group.</div>
  </div>

  <Gap style="height: 16px" />

  <DeepBtn
    label="Help"
    color="primary"
    :to="{ name: 'help' }"
  />
</template>
