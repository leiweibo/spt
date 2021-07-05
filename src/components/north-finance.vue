<template>
  <NorthHoldingQuota :showInput="true"/>
</template>
<script>
import NorthHoldingQuota from "./north-holding-quota"

export default {
  name: 'north-finance',
  components: {NorthHoldingQuota},
  data() {
    return {
      passedData: {
        code: '601878',
        market: 21,
        date0: '2021-06-01',
        date1: '2021-06-30'
      }
    }
  }
}
</script>

