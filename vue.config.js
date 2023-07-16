const { defineConfig } = require('@vue/cli-service')
let gateway
let cookie
gateway = ' https://show.bilibili.com/'

cookie = `m0J'uY)mRkuu|l; buvid_fp_plain=undefined; FEED_LIVE_VERSION=V_LIVE_2; header_theme_version=CLOSE; PVID=1; browser_resolution=2560-1343; innersign=0; b_lsid=6265AB76_1895C8C8924; bp_t_offset_34866765=818635940744396809; msource=pc_web; deviceFingerprint=613bf6d499a0aa80aba4dc366a1a119c; Hm_lvt_909b6959dc6f6524ac44f7d42fc290db=1689424479,1689474870; fingerprint=6ef585d4e2c15799855047d614b4b4c7; buvid_fp=6ef585d4e2c15799855047d614b4b4c7; SESSDATA=84658f6a%2C1705026961%2C82a88%2A72h6szcmED6rEjSb4ZQdeNcFspQITo4_vAy2ES2nnNQza4Q0hrVqVoImjc0rhiORC4sEoWzAAADwA; bili_jct=aed132d5b10a91ce7a3e8af8108efdf6; DedeUserID=516963415; DedeUserID__ckMd5=21e47f43808af9a6; sid=52dikv5i; Hm_lpvt_909b6959dc6f6524ac44f7d42fc290db=1689474978`
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
