const { defineConfig } = require('@vue/cli-service')
let gateway
let cookie
gateway = ' https://show.bilibili.com/'

cookie = `b_nut=1673612630; i-wanna-go-back=-1; _uuid=5883C59A-10598-7837-6173-E1935D9BF55C30415infoc; buvid4=38239556-5668-F439-3473-6AA0AE164DBC32065-023011320-0HQWf7U9Yhl2UOX5oLjtwA%3D%3D; rpdid=|(kmRY|)J|~m0J'uY~JYuk~u); LIVE_BUVID=AUTO3816736995247771; buvid_fp_plain=undefined; nostalgia_conf=-1; is-2022-channel=1; CURRENT_BLACKGAP=0; hit-dyn-v2=1; CURRENT_PID=f81fbd80-cd79-11ed-b7aa-a36dfa7bedc0; b_ut=5; DedeUserID=293942714; DedeUserID__ckMd5=9e2bb0fa9dc16199; buvid3=EF56117D-D130-4425-9686-B6ABAEBD71AF36735infoc; FEED_LIVE_VERSION=V_NO_BANNER_3; header_theme_version=CLOSE; CURRENT_QUALITY=0; hit-new-style-dyn=1; CURRENT_FNVAL=4048; bp_article_offset_293942714=815872683359076400; PVID=2; fingerprint=f252df8c82bb23bec0676ccac95de443; buvid_fp=2575e8faaf2fb4fe93504f52afd4cdda; deviceFingerprint=8d6edf1828fdcf2d60634c4a27369c23; kfcFrom=pwng-pc; kfcSource=mall_piaowu_pc_15047_banner; msource=pc_web; innersign=0; b_lsid=DD821F79_18948ACA5BF; home_feed_column=5; browser_resolution=1707-916; SESSDATA=a9e11313%2C1704693423%2Cf5b47%2A71rVD_z0ql6iq8-fuJSn1D-l4HHCi1REQcGWMKMz5JgpeE45rIFzNtPIAEzmExZ6JA1GoPmAAADgA; bili_jct=ded35c28f122549a8c28cd32ba5e1185; sid=oinm744w; from=pc_search; bp_video_offset_293942714=817329300023804000`
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
