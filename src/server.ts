import axios from "axios";

export async function getData(cb: any) {
  const url = "https://v1.hitokoto.cn/";

  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return cb(response.data);
}
