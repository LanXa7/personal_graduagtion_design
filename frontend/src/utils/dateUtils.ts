/**
 * 将时间格式化为北京时间（UTC+8）
 * @param date 日期对象或可以被Date构造函数解析的字符串
 * @param format 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的北京时间字符串
 */
export function formatBeiJingTime(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  // 确保输入为Date对象
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // 转换为北京时间（UTC+8）
  const beijingTime = new Date(dateObj.getTime() + 8 * 60 * 60 * 1000);
  
  const year = beijingTime.getUTCFullYear();
  const month = (beijingTime.getUTCMonth() + 1 < 10) ? '0' + (beijingTime.getUTCMonth() + 1) : '' + (beijingTime.getUTCMonth() + 1);
  const day = (beijingTime.getUTCDate() < 10) ? '0' + beijingTime.getUTCDate() : '' + beijingTime.getUTCDate();
  const hours = (beijingTime.getUTCHours() < 10) ? '0' + beijingTime.getUTCHours() : '' + beijingTime.getUTCHours();
  const minutes = (beijingTime.getUTCMinutes() < 10) ? '0' + beijingTime.getUTCMinutes() : '' + beijingTime.getUTCMinutes();
  const seconds = (beijingTime.getUTCSeconds() < 10) ? '0' + beijingTime.getUTCSeconds() : '' + beijingTime.getUTCSeconds();
  
  // 根据格式进行替换
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化为中文风格的北京时间
 * @param date 日期对象或可以被Date构造函数解析的字符串
 * @returns 格式化后的中文风格北京时间字符串，如"2023年05月21日 08:30:45"
 */
export function formatChineseTime(date: Date | string | number): string {
  // 使用基础格式化函数并调整格式
  const year = formatBeiJingTime(date, 'YYYY');
  const month = formatBeiJingTime(date, 'MM');
  const day = formatBeiJingTime(date, 'DD');
  const time = formatBeiJingTime(date, 'HH:mm:ss');
  
  return `${year}年${month}月${day}日 ${time}`;
} 