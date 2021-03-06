import moment from "moment";

// 播放记录
const play_log = {
  namespaced: true,
  state: {
    data: [
      /*
    {
      url: "", // 视频地址
      type: video | web, // video: 视频播放记录  web: 播放记录
      visitDate: "2019-09-11", // 访问时间
      title: "" // 视频title
      playTime: "00:00:00" // 播放时间  播放到哪里下次继续播放
      platformSite: ''  // 平台地址
    }
    */
    ]
  },
  mutations: {
    // 初始化
    init(state) {
      let cache = localStorage.getItem("play_log")
        ? JSON.parse(localStorage.getItem("play_log"))
        : "";

      state.data = [...cache];
    },

    // 添加数据
    add(state, obj) {
      let { data } = state;

      let newdata = data.filter(val => {
        return val.url != obj.url;
      });

      newdata.unshift({
        ...obj,
        playTime: 0,
        visitDate: moment().format("hh:mm a")
      });

      state.data = newdata;

      this.commit("play_log/saveLocal");
    },

    saveLocal(state) {
      localStorage.setItem("play_log", JSON.stringify(state.data));
    }
  },
  actions: {},
  getters: {}
};

export default play_log;
