const { defineConfig } = require('@vue/cli-service')
let gateway
let cookie
gateway = ' https://show.bilibili.com/'

cookie = `b_nut=1673612630; i-wanna-go-back=-1; _uuid=5883C59A-10598-7837-6173-E1935D9BF55C30415infoc; buvid4=38239556-5668-F439-3473-6AA0AE164DBC32065-023011320-0HQWf7U9Yhl2UOX5oLjtwA%3D%3D; rpdid=|(kmRY|)J|~m0J'uY~JYuk~u); LIVE_BUVID=AUTO3816736995247771; buvid_fp_plain=undefined; nostalgia_conf=-1; is-2022-channel=1; CURRENT_BLACKGAP=0; hit-dyn-v2=1; CURRENT_PID=f81fbd80-cd79-11ed-b7aa-a36dfa7bedc0; buvid3=EF56117D-D130-4425-9686-B6ABAEBD71AF36735infoc; header_theme_version=CLOSE; CURRENT_QUALITY=0; hit-new-style-dyn=1; CURRENT_FNVAL=4048; bp_article_offset_293942714=815872683359076400; fingerprint=2575e8faaf2fb4fe93504f52afd4cdda; buvid_fp=f252df8c82bb23bec0676ccac95de443; bp_video_offset_293942714=817995458050785400; FEED_LIVE_VERSION=V8; SESSDATA=da0b28ca%2C1704848575%2Cb4a45%2A72ap601zzQ_JcHmBtv9x_vINUmFC1nDjRmEXDIZnvEDDJXB_wybgzewCMYLzxlnSQ6-Q5IHAAANgA; bili_jct=cb3fe5d2076f03499e60a3f1c1ce654f; DedeUserID=1322349254; DedeUserID__ckMd5=12faba0782a1ddae; bp_video_offset_1322349254=817867768665735200; b_ut=5; PVID=2; innersign=0; b_lsid=EE89710A2_18961421727; home_feed_column=5; browser_resolution=1707-915; msource=pc_web; deviceFingerprint=8d6edf1828fdcf2d60634c4a27369c23; from=pc_ticketlist`
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.module
      .rule('media')
      .test(/\.(mp3)(\?.*)?$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'media/[name].[hash:8].[ext]'
      })
      .end();
  },
  devServer: {
    host: "localhost",
    port: 8080,
    open: true,
    proxy: {
      "/api": {
        target: "https://show.bilibili.com/",
        changeOrigin: true,
        ws: true,
        headers: {
          Cookie: cookie,
          Referer: gateway,
          Origin: gateway,
        },
      }
    },
  },
})
