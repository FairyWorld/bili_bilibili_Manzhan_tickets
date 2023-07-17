<template>
  <div>
    <div style="margin-top: 20vh;margin-bottom: 10vh;">
    <a-card title="BW2023"  style="margin: 0 auto;" class="card-fit">
      <a-alert v-bind:message="tishi" type="success" />
      <a-form
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"  
        style="margin: 2vh 2vw 2vh 2vw"
      >
      <!-- <a-form-item label="cookie" name="cookie">
        <a-textarea v-model:value="cookie" placeholder="textarea with clear icon" allow-clear />
        </a-form-item> -->
        <a-form-item label="漫展id" name="漫展id">
          <a-input v-model:value="piaoId" />
        </a-form-item>
        <a-form-item label="抢票日期" name="抢票日期">
          <a-date-picker  format="YYYY-MM-DD" @change="onChange" />
        </a-form-item>
        <a-form-item label="票价" name="票价">
          <a-select ref="select" v-model:value="moeny">
            <a-select-option value="12800">128</a-select-option>
            <a-select-option value="32800">328</a-select-option>
            <a-select-option value="58800">588</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="是否为捡漏票" name="是否为捡漏票">
          <a-radio-group v-model:value="isJl" name="radioGroup">
            <a-radio value="1">是</a-radio>
            <a-radio value="0">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="频率" name="频率">
          <a-input v-model:value="time">
            <template #addonAfter>
              <span>秒抢一个</span>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" html-type="submit" @click="onclick"
          >开始</a-button
          >
        </a-form-item>
      </a-form>
    </a-card>
  </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

// let cookie;
//页面输入参数
let qpDate = ref();
const moeny = ref("12800");
const time = ref("0.4");

const piaoId = ref("73710");
const tishi = ref("info");
const isJl = ref('1');
//需要的接口参数
const grxx = ref();
const ticketList = ref();
const screenId = ref();
const getPiaoType = ref(0);
const token = ref();
//两个定时器
const oneSetRepeatTask = ref();
const setRepeatTask = ref();
const onChange = (value, dateString) => {
  console.log('Selected Time: ', value);
  console.log('Formatted Selected Time: ', dateString);
  qpDate=ref(dateString);
};
const onclick = async () => {
  // if(cookie)
  // {
  //   window.localStorage.setItem("cookie",cookie);
  // }
  // else{
  //   alert("cookies尚未获取");
  // }
  clearInterval(oneSetRepeatTask.value);
  clearInterval(setRepeatTask.value);
  //获取时间是否可以抢票
  //时间到了，开始抢票
  tishi.value = "正在获取个人信息";
  await getPerInf(); //获取信息
  tishi.value = "正在获取票务信息";
  let i = 0;
  oneSetRepeatTask.value = setInterval(
    async () => {
      await getTicketInf(); //获取id
      //去抢
      if (ticketList.value[getPiaoType.value].clickable || isJl.value) {
        tishi.value = `获取getTonke中....`;
        clearInterval(oneSetRepeatTask.value);
        await grabTicket();
      }
      i++;
      tishi.value = `第${i}次判断是否有票`;
    },
    time.value ? time.value * 1000 : 1000
  );
};
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
  setRepeatTask.value = setInterval(async () => {
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
      tishi.value = `第${i}次抢票，判断票是否可以使用`;
      //付款界面
      let resPay = await axios({
        method: "GET",
        url: `/api/ticket/order/createstatus?token=${
          res.data.data.token
        }&timestamp=${new Date().getTime()}&project_id=${piaoId.value}`,
      });
      if (resPay.data.data.payParam) {
        clearInterval(setRepeatTask.value);
        let payObj = resPay.data.data.payParam;
        delete payObj.code_url;
        delete payObj.expire_time;
        delete payObj.pay_type;
        delete payObj.use_huabei;
        let params = encodeURIComponent(JSON.stringify(payObj));
        window.open(
          "https://pay.bilibili.com/payplatform-h5/pccashier.html?params=" +
            params,
          "_blank"
        );
        tishi.value = `第${i}次抢票，抢到了，请尽快去支付`;
        let audio = new Audio("./aaa.mp3");
        audio.autoplay = true;
        audio.loop = true;
        audio.play();
        alert("抢到了，请尽快去支付");
      }
    } else {
      tishi.value = `第${i}次抢票，${res.data.msg}`;
    }
    if (res.data.errno === 100051) {
      onclick();
    }
    if (i > 500) {
      clearInterval(setRepeatTask.value);

      onclick();
    }
  }, 1000);
};
//  const setCookie=()=> {
//   if(window.localStorage.getItem("cookie"))
//   {
//     cookie=window.localStorage.getItem("cookie");
//   }
// };
// document.addEventListener("DOMContentLoaded",setCookie);
</script>

<style>
@media only screen and (max-width: 600px) {
  .card-fit{
    width: 90vw;
  }
}
@media only screen and (min-width: 600px) {
  .card-fit {
    width: 600px;
  }
}
</style>
