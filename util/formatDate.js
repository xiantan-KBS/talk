/**
 * 格式化时间
 * @param {*} time 时间
 * @returns 
 */
function formDate(time) {
  var date = new Date(time);
  return `${date.getFullYear()}-${fill0(date.getMonth() + 1)}-${fill0(date.getDate())} ${fill0(date.getHours())}:${fill0(date.getMinutes())}:${fill0(date.getSeconds())}`
}

/**
 * 补零操作
 * @param {*} num 根据传入的数字来决定是否要补零
 */
function fill0(num) {
  return num < 10 ? '0' + num : num
}