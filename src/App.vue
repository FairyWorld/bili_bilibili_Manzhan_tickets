<template>
  <div>
    <div>只可以抢默认购票人</div>
    <div>票信息ID（url上有）<input type="text" v-model="piaoId" /></div>
    <div>抢票日期 <input type="date" v-model="qpDate" /></div>
    <div>钱数<input type="text" v-model="moeny" />（分）</div>
    <div><input type="text" v-model="time" />秒抢一次</div>
    <div>
      <input type="datetime-local" v-model="inputSetTime" />设定开始抢票时间
    </div>
    <div>{{ tishi }}</div>
    <button @click="onclick">开始</button>
    <button @click="toStop">停止</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
//页面输入参数
const qpDate = ref();
const moeny = ref();
const time = ref();
const piaoId = ref();
const inputSetTime = ref();
const tishi = ref();
//需要的接口参数
const grxx = ref();
const ticketList = ref();
const screenId = ref();
const getPiaoType = ref(0);
const token = ref();

const onclick = async () => {
  //获取时间是否可以抢票
  if (
    !inputSetTime.value ||
    new Date().getTime() > new Date(inputSetTime.value).getTime()
  ) {
    //时间到了，开始抢票
    tishi.value = "正在获取个人信息";
    await getPerInf(); //获取信息
    tishi.value = "正在获取票务信息";
    let i = 0;
    let oneSetRepeatTask = setInterval(
      async () => {
        await getTicketInf(); //获取id
        //去抢
        //if (!ticketList.value[getPiaoType.value].clickable) {
          tishi.value = `获取getTonke中....`;
          clearInterval(oneSetRepeatTask);
          await grabTicket();
        //}
        i++;
        tishi.value = `第${i}次判断是否有票`;
      },
      time.value ? time.value * 1000 : 1000
    );
  } else {
    tishi.value = "时间还没有到哦";
  }
};
const toStop = () => {};
//获取个人信息
const getPerInf = async () => {
  let res = await axios({
    method: "GET",
    url: `/api/ticket/buyer/list?is_default&projectId=${piaoId.value}`,
  });
  grxx.value = res.data.data.list;
  grxx.value[0].isBuyerInfoVerified = true;
  grxx.value[0].isBuyerValid = true;
};
//获取票信息
const getTicketInf = async () => {
  let res = await axios({
    method: "GET",
    url: `/api/ticket/project/get?version=134&id=${piaoId.value}`,
  });
  let arr = res.data.data;
  for (let i = 0; i < arr.screen_list.length; i++) {
    if (arr.screen_list[i].show_date === qpDate.value) {
      ticketList.value = arr.screen_list[i].ticket_list;
      screenId.value = arr.screen_list[i].id;
      break;
    }
  }
  for (let i = 0; i < ticketList.value.length; i++) {
    if (ticketList.value[i].price === +moeny.value) {
      getPiaoType.value = i;
      break;
    }
  }
};
//获取Token
const getTonke = async () => {
  let res = await axios({
    //获取token
    method: "POST",
    url: `/api/ticket/order/prepare`,
    data: {
      project_id: piaoId.value,
      screen_id: screenId.value,
      order_type: 1,
      count: 1,
      sku_id: ticketList.value[getPiaoType.value].id,
      token: "",
    },
  });

  if (res.data.data.shield.verifyMethod) {
    window.open(res.data.data.shield.naUrl, "_blank");
    location.reload();
  }
  token.value = res.data.data.token;
};
//抢票
const grabTicket = async () => {
  let i = 0;
  await getTonke();
  let setRepeatTask = setInterval(async () => {
    i++;
    let res = await axios({
      //抢
      method: "POST",
      url: `/api/ticket/order/createV2`,
      data: {
        project_id: piaoId.value, //1.输入
        screen_id: screenId.value, //2.获取票信息接口
        sku_id: ticketList.value[getPiaoType.value].id, //3.获取票信息接口
        count: 1, //数量
        pay_money: +moeny.value, //钱数
        order_type: 1,
        timestamp: new Date().getTime(),
        token: token.value, //获取token接口
        deviceId: "3c2003ba05634736371905d33a47f77d",
        buyer_info: JSON.stringify(grxx.value), //获取个人信息接口
      },
    });
    if (res.data.errno === 0 && res.data.errtag === 0 && res.data.data.token) {
      clearInterval(setRepeatTask);
      tishi.value = `第${i}次抢票，抢到了，请尽快去支付`;
      alert("抢到了，请尽快去支付");
    } else {
      tishi.value = `第${i}次抢票，${res.data.msg}`;
    }
    if (i > 1000) {
      clearInterval(setRepeatTask);
      onclick();
    }
  }, 1000);
};
</script>

<style></style>
