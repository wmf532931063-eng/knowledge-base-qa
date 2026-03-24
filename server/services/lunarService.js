/**
 * 农历转换服务
 * 用于将公历出生日期转换为农历生辰八字
 */

const lunisolar = require('lunisolar');

/**
 * 将公历日期字符串转换为农历日期
 * @param {string} dateStr - 公历日期字符串，格式：YYYY-MM-DD 或 YYYY年MM月DD日
 * @param {number} hour - 出生时辰（0-23），可选
 * @returns {Object} 农历日期对象，包含年、月、日、时辰、八字等
 */
function convertSolarToLunar(dateStr, hour = null) {
  console.log(`🌙 开始转换公历日期: ${dateStr}${hour !== null ? ` 时辰: ${hour}时` : ''}`);
  
  // 提取日期部分
  let year, month, day;
  
  // 处理不同格式的日期字符串
  if (dateStr.includes('-')) {
    // YYYY-MM-DD格式
    const parts = dateStr.split('-');
    year = parseInt(parts[0]);
    month = parseInt(parts[1]);
    day = parseInt(parts[2]);
  } else if (dateStr.includes('年') && dateStr.includes('月') && dateStr.includes('日')) {
    // 中文格式：YYYY年MM月DD日
    const yearMatch = dateStr.match(/(\d{4})年/);
    const monthMatch = dateStr.match(/(\d{1,2})月/);
    const dayMatch = dateStr.match(/(\d{1,2})日/);
    
    year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
    month = monthMatch ? parseInt(monthMatch[1]) : 1;
    day = dayMatch ? parseInt(dayMatch[1]) : 1;
  } else {
    // 尝试解析为Date对象
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error('日期格式无效，请使用YYYY-MM-DD或YYYY年MM月DD日格式');
    }
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
  }
  
  // 验证日期有效性
  if (year < 1900 || year > 2100) {
    throw new Error('年份必须在1900-2100年之间');
  }
  if (month < 1 || month > 12) {
    throw new Error('月份必须在1-12月之间');
  }
  if (day < 1 || day > 31) {
    throw new Error('日期必须在1-31日之间');
  }
  
  try {
    // 使用lunisolar库进行专业农历转换
    const lsr = lunisolar(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    
    // 获取农历信息 - 根据测试，lunar是对象属性
    const lunar = lsr.lunar;
    
    // 获取八字（四柱） - 根据测试，char8是对象属性
    const eightChar = lsr.char8;
    
    // 根据农历年计算生肖（简化方法）
    // 生肖顺序：鼠、牛、虎、兔、龙、蛇、马、羊、猴、鸡、狗、猪
    const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const zodiacIndex = (lunar.year - 4) % 12;
    const zodiac = zodiacAnimals[zodiacIndex];
    
    // 获取时辰地支（如果有小时）
    let hourBranch = '未知';
    let hourStemBranch = '未知';
    let hourEightChar = '未知';
    if (hour !== null && hour >= 0 && hour <= 23) {
      // 使用完整的日期时间创建新对象获取时辰八字
      const hourDateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:00`;
      const hourLs = lunisolar(hourDateStr);
      const hourChar8 = hourLs.char8;
      hourEightChar = hourChar8.toString().split(' ')[3] || '未知';
      
      // 时辰地支是八字时柱的地支
      hourStemBranch = hourEightChar;
      hourBranch = hourEightChar.substring(1) || '未知';
    }
    
    // 获取节气信息
    const solarTerm = lsr.solarTerm;
    
    // 农历月份中文名称
    const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', 
                         '七月', '八月', '九月', '十月', '冬月', '腊月'];
    const lunarMonthName = lunarMonths[lunar.month - 1] || `农历${lunar.month}月`;
    
    // 农历日中文名称
    const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                       '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                       '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    const lunarDayName = lunarDays[lunar.day - 1] || `农历${lunar.day}日`;
    
    // 解析八字字符串
    const eightCharStr = eightChar.toString();
    const eightCharParts = eightCharStr.split(' ');
    
    const lunarResult = {
      // 农历年信息
      lunarYear: lunar.year,
      lunarYearNum: lunar.year,
      lunarYearStemBranch: eightCharParts[0] || '未知',
      zodiacAnimal: zodiac,
      
      // 农历月信息
      lunarMonth: lunar.month,
      lunarMonthNum: lunar.month,
      lunarMonthStemBranch: eightCharParts[1] || '未知',
      lunarMonthName: lunarMonthName,
      isLeapMonth: lunar.month > lunar.leapMonth, // 简化判断
      
      // 农历日信息
      lunarDay: lunar.day,
      lunarDayNum: lunar.day,
      lunarDayStemBranch: eightCharParts[2] || '未知',
      lunarDayName: lunarDayName,
      
      // 时辰信息
      hour: hour,
      hourBranch: hourBranch,
      hourStemBranch: hourStemBranch,
      hourStemBranchFull: hourEightChar,
      
      // 八字（四柱）
      eightChar: eightCharStr,
      eightCharDetail: {
        year: eightCharParts[0] || '未知',
        month: eightCharParts[1] || '未知',
        day: eightCharParts[2] || '未知',
        hour: hourEightChar
      },
      
      // 节气信息
      solarTerm: solarTerm?.name || '无',
      solarTermDate: '未知', // 简化处理
      
      // 原始公历日期
      solarYear: year,
      solarMonth: month,
      solarDay: day,
      solarDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      
      // 其他信息
      lunarDateStr: `${lunar.year}年${lunarMonthName}${lunarDayName}`,
      fullLunarInfo: `${lunar.year}年(${zodiac}) ${lunarMonthName}${lunarDayName}`,
      
      // 标记为专业版本
      isProfessional: true,
      note: hour === null ? '如需精确八字排盘，请提供具体出生时间（时辰）' : '完整八字排盘已完成'
    };
    
    console.log(`✅ 农历转换完成: ${lunarResult.lunarDateStr}`);
    console.log(`📝 八字: ${lunarResult.eightChar}`);
    
    return lunarResult;
  } catch (error) {
    console.error('❌ lunisolar转换失败:', error.message);
    
    // 降级到简化版本
    console.log('⚠️ 使用简化农历转换作为备选');
    return simplifiedLunarConversion(year, month, day, hour);
  }
}

/**
 * 简化的农历转换函数
 * 注意：这是一个简化版本，实际应用中需要使用完整的农历算法库
 */
function simplifiedLunarConversion(solarYear, solarMonth, solarDay) {
  // 天干地支映射
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  
  // 农历月份名称
  const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', 
                       '七月', '八月', '九月', '十月', '冬月', '腊月'];
  
  // 农历日名称
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                     '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                     '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  
  // 简化转换：这里只是演示，实际需要完整农历算法
  // 计算天干地支（简化算法）
  const stemIndex = (solarYear - 4) % 10;
  const branchIndex = (solarYear - 4) % 12;
  const zodiacIndex = (solarYear - 4) % 12;
  
  const heavenlyStem = heavenlyStems[stemIndex];
  const earthlyBranch = earthlyBranches[branchIndex];
  const zodiacAnimal = zodiacAnimals[zodiacIndex];
  
  // 简化农历日期（实际需要根据具体日期计算）
  // 这里使用一个简单的偏移量作为演示
  const lunarMonthIndex = (solarMonth + 1) % 12;
  const lunarDayIndex = (solarDay - 1) % 30;
  
  return {
    // 农历年信息
    lunarYear: solarYear,
    lunarYearStemBranch: `${heavenlyStem}${earthlyBranch}`,
    zodiacAnimal: zodiacAnimal,
    
    // 农历月日
    lunarMonth: lunarMonths[lunarMonthIndex],
    lunarMonthNum: lunarMonthIndex + 1,
    lunarDay: lunarDays[lunarDayIndex],
    lunarDayNum: lunarDayIndex + 1,
    
    // 原始公历日期
    solarYear: solarYear,
    solarMonth: solarMonth,
    solarDay: solarDay,
    solarDate: `${solarYear}-${solarMonth.toString().padStart(2, '0')}-${solarDay.toString().padStart(2, '0')}`,
    
    // 时辰信息（需要具体时间）
    hourBranch: '未知',
    
    // 标记为简化版本
    isSimplified: true,
    note: '此为简化农历转换，如需精确八字排盘，请提供具体出生时间（时辰）并使用专业排盘工具'
  };
}

/**
 * 提取出生日期信息从问题中
 * @param {string} question - 用户问题
 * @returns {Object|null} 提取的日期信息，或null如果未找到
 */
function extractBirthDate(question) {
  console.log(`🔍 从问题中提取出生日期: "${question}"`);
  
  const datePatterns = [
    // 格式：YYYY年MM月DD日
    /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/,
    // 格式：YYYY-MM-DD
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    // 格式：YYYY/MM/DD
    /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
    // 格式：YYYY.MM.DD
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
    // 中文描述：X年X月X日出生
    /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日\s*(出生|生)/,
    // 中文描述：出生于X年X月X日
    /出生于\s*(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/,
    // 简单数字：1990年1月1日
    /(\d{4})年(\d{1,2})月(\d{1,2})日/
  ];
  
  for (const pattern of datePatterns) {
    const match = question.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);
      
      // 验证日期
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        console.log(`✅ 提取到出生日期: ${year}年${month}月${day}日`);
        return {
          year,
          month,
          day,
          originalText: match[0],
          format: match[0].includes('-') ? 'YYYY-MM-DD' : 
                  match[0].includes('/') ? 'YYYY/MM/DD' :
                  match[0].includes('.') ? 'YYYY.MM.DD' : 'YYYY年MM月DD日'
        };
      }
    }
  }
  
  console.log(`❌ 未找到有效的出生日期`);
  return null;
}

/**
 * 处理包含出生日期的问题
 * @param {string} question - 原始问题
 * @returns {Object} 处理结果
 */
function processBirthDateQuestion(question) {
  const dateInfo = extractBirthDate(question);
  
  if (!dateInfo) {
    return {
      hasDate: false,
      originalQuestion: question,
      processedQuestion: question
    };
  }
  
  try {
    // 提取时辰信息
    let hour = null;
    const hourPattern = /(\d{1,2})[点时]/;
    const hourMatch = question.match(hourPattern);
    if (hourMatch) {
      hour = parseInt(hourMatch[1]);
      if (hour < 0 || hour > 23) hour = null;
    }
    
    // 转换农历
    const lunarInfo = convertSolarToLunar(`${dateInfo.year}-${dateInfo.month}-${dateInfo.day}`, hour);
    
    // 构建包含农历信息的新问题
    let note = `根据您提供的公历${dateInfo.year}年${dateInfo.month}月${dateInfo.day}日`;
    if (hour !== null) {
      note += ` ${hour}时`;
    }
    note += `，转换为农历：${lunarInfo.lunarDateStr}`;
    
    if (lunarInfo.eightChar) {
      note += `，八字：${lunarInfo.eightChar}`;
    }
    
    if (lunarInfo.isSimplified) {
      note += `。此为简化转换，如需精确排盘请提供具体时辰。`;
    } else if (hour === null) {
      note += `。如需完整八字排盘，请提供具体出生时辰。`;
    } else {
      note += `。完整八字排盘已完成。`;
    }
    
    const processedQuestion = `${question}\n\n（注：${note}）`;
    
    return {
      hasDate: true,
      dateInfo,
      lunarInfo,
      originalQuestion: question,
      processedQuestion,
      isSimplified: lunarInfo.isSimplified || false,
      hasHour: hour !== null
    };
  } catch (error) {
    console.error(`❌ 农历转换失败:`, error.message);
    return {
      hasDate: true,
      dateInfo,
      lunarInfo: null,
      originalQuestion: question,
      processedQuestion: `${question}\n\n（注：识别到出生日期${dateInfo.year}年${dateInfo.month}月${dateInfo.day}日，但农历转换失败，将基于公历日期进行分析。）`,
      error: error.message
    };
  }
}

/**
 * 判断问题是否包含出生日期
 * @param {string} question - 用户问题
 * @returns {boolean}
 */
function containsBirthDate(question) {
  const keywords = ['出生', '生辰', '生日', '年月日', '八字', '四柱', '命理', '算命'];
  const hasKeyword = keywords.some(keyword => question.includes(keyword));
  
  if (!hasKeyword) return false;
  
  // 进一步检查是否包含日期模式
  return extractBirthDate(question) !== null;
}

module.exports = {
  convertSolarToLunar,
  extractBirthDate,
  processBirthDateQuestion,
  containsBirthDate
};