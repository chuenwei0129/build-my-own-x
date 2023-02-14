const axios = createInstance()

// 测试 axios 拦截器
axios.interceptors.request.use(
  (config) => {
    console.log('成功请求拦截器 2')
    // 需要把参数通过 promise 链传出去，此处就是 promise.then(onFulfilled)
    return config
  },
  () => console.log('失败请求拦截器 2')
)

axios.interceptors.request.use(
  (config) => {
    console.log('成功请求拦截器 1')
    return config
  },
  () => console.log('失败请求拦截器 1')
)

axios.interceptors.response.use(
  (res) => {
    console.log('成功响应拦截器 1')
    return res
  },
  () => console.log('失败响应拦截器 1')
)

axios.interceptors.response.use(
  (res) => {
    console.log('成功响应拦截器 2')
    return res
  },
  () => console.log('失败响应拦截器 2')
)

// 测试 axios 的取消方法
let cancel = null

const getPosts = () => {
  // 第二次请求，如果 cancel 不为 null，则取消上一次请求，cancel 为 null 表示请求都结束了
  if (cancel !== null) {
    // 此时 cancel 就是 () => resolvePromise(), cancel 执行，promise 就会改变状态
    cancel()
  }
  axios({
    method: 'GET',
    url: 'http://127.0.0.1:8090/posts',
    cancelToken: new axios.cancelToken((c) => {
      // c === () => resolvePromise()
      cancel = c
    }),
  }).then((res) => {
    console.log('响应数据', JSON.stringify(res))
    cancel = null
  })
}

document.querySelector('#btn1').addEventListener('click', getPosts)
document.querySelector('#btn2').addEventListener('click', () => {
  cancel && cancel()
})

// 测试 crud
const qs = Qs
const axios2 = createInstance()
const container = document.querySelector('#container')
const searchId = document.querySelector('#search-id')
const addBtn = document.querySelector('#add-btn')
const userId = document.querySelector('#user-id')
const userName = document.querySelector('#user-name')
const url = 'http://127.0.0.1:3000/users'

// 查询
const getUsersById = () => {
  // 用户 axios get 配置
  const getConfig = {
    url,
    params: {
      id: userId.value,
    },
  }

  // 兼容 json-server 的接口（http://127.0.0.1:3000/users?id='' 会返回空数组）
  getConfig.params.id === '' && delete getConfig.params

  // 模拟 axios 内部 get 处理
  getConfig.url = getConfig.params
    ? `${getConfig.url}?${qs.stringify(getConfig.params)}`
    : getConfig.url

  axios2.get(getConfig.url).then(
    (res) => {
      const { data } = res
      if (data.length === 0) container.innerHTML = '没有数据'
      let users = ''
      data.forEach(({ id, name }) => {
        users += `<li>
        <b>id</b> : <span>${id}</span> ----
        <b>name</b> : <span>${name}</span> ----
        <button class="${id}">删除</button>
        <button id="${id}">编辑</button>
      </li>`
        container.innerHTML = users
      })
    },
    (err) => {
      console.log('错误', err)
    }
  )
}

searchId.addEventListener('click', getUsersById)

const mounted = () => {
  getUsersById()
}

mounted()

// 新增
const addUser = () => {
  // 用户 axios post 配置
  const postConfig = {
    url,
    method: 'POST',
    data: {
      name: userName.value,
    },
  }

  // 模拟 内部 post 处理
  // https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/send
  postConfig.data = qs.stringify(postConfig.data)

  axios2.post(postConfig).then(() => {
    mounted()
    userName.value = ''
  })
}

addBtn.addEventListener('click', addUser)

// 编辑
// 事件委托
container.addEventListener('click', function (e) {
  if (e.target.className) {
    axios2({
      url: url + '/' + e.target.className,
      method: 'DELETE',
    }).then(() => {
      mounted()
    })
  } else if (e.target.id) {
    // 编辑功能
    const user_name = prompt(
      '请输入新的用户名？',
      `${e.target.parentNode.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.innerText}`
    )

    const editConfig = {
      url: url + '/' + e.target.id,
      method: 'PATCH',
      data: {
        name: user_name,
      },
    }

    editConfig.data = qs.stringify(editConfig.data)

    user_name &&
      axios2(editConfig).then(() => {
        mounted()
      })
  }
})
