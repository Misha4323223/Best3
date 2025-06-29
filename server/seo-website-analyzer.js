
/**
 * SEO Website Analyzer - Полный анализ сайтов с рекомендациями
 * Интеграция с существующей системой парсинга и поиска
 */

const fetch = require('node-fetch');
const https = require('https');
const { parseWebContent, extractTextContent } = require('./web-content-parser');

// Агент для игнорирования SSL ошибок
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Основная функция анализа сайта
 * @param {string} url - URL сайта для анализа
 * @returns {Promise<Object>} Полный отчет SEO анализа
 */
async function analyzeSiteComprehensive(url) {
  console.log(`🔍 [SEO] Начинаем полный анализ сайта: ${url}`);
  
  try {
    // Получаем HTML страницы
    const htmlContent = await fetchSiteHTML(url);
    if (!htmlContent) {
      throw new Error('Не удалось загрузить контент сайта');
    }

    // Параллельный анализ всех компонентов
    const [
      basicInfo,
      seoAnalysis,
      mobileAnalysis,
      contentAnalysis,
      techAnalysis
    ] = await Promise.all([
      extractBasicInfo(htmlContent, url),
      analyzeSEO(htmlContent),
      analyzeMobileOptimization(htmlContent),
      analyzeContent(htmlContent),
      analyzeTechnology(htmlContent, url)
    ]);

    // Генерируем рекомендации на основе анализа
    const recommendations = generateRecommendations({
      basicInfo,
      seoAnalysis,
      mobileAnalysis,
      contentAnalysis,
      techAnalysis
    });

    // Формируем финальный отчет
    const report = {
      url,
      timestamp: new Date().toISOString(),
      basicInfo,
      seoAnalysis,
      mobileAnalysis,
      contentAnalysis,
      techAnalysis,
      recommendations,
      overallScore: calculateOverallScore({
        seoAnalysis,
        mobileAnalysis,
        contentAnalysis
      })
    };

    console.log(`✅ [SEO] Анализ завершен. Общий балл: ${report.overallScore}/100`);
    return {
      success: true,
      report,
      formattedReport: formatReportMarkdown(report)
    };

  } catch (error) {
    console.error('❌ [SEO] Ошибка анализа:', error);
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

/**
 * Загружает HTML контент сайта
 */
async function fetchSiteHTML(url) {
  try {
    console.log(`🌐 [SEO] Загружаем HTML: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      timeout: 15000,
      agent: url.startsWith('https:') ? httpsAgent : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`✅ [SEO] HTML загружен: ${html.length} символов`);
    return html;

  } catch (error) {
    console.error(`❌ [SEO] Ошибка загрузки HTML:`, error);
    return null;
  }
}

/**
 * Извлекает базовую информацию о сайте
 */
async function extractBasicInfo(html, url) {
  console.log('🔍 [SEO] Анализируем базовую информацию...');
  
  const info = {
    platform: detectPlatform(html),
    title: extractTitle(html),
    categories: extractProductCategories(html),
    contacts: extractContacts(html),
    forms: extractForms(html),
    paymentMethods: extractPaymentMethods(html)
  };

  console.log(`✅ [SEO] Базовая информация извлечена. Платформа: ${info.platform}`);
  return info;
}

/**
 * Определяет платформу сайта
 */
function detectPlatform(html) {
  const platforms = {
    'Tilda': [
      /tilda\.cc|tilda\.ws/i,
      /t-tildalabel/i,
      /class="t-/i,
      /"rec\d+"/i
    ],
    'WordPress': [
      /wp-content|wp-includes/i,
      /wordpress/i,
      /wp-json/i
    ],
    'Shopify': [
      /shopify/i,
      /cdn\.shopify\.com/i,
      /Shopify\.theme/i
    ],
    'WIX': [
      /wix\.com|wixstatic\.com/i,
      /WixSite/i
    ],
    'Битрикс': [
      /bitrix/i,
      /bx-/i,
      /1c-bitrix/i
    ],
    'OpenCart': [
      /catalog\/view\/theme/i,
      /route=product/i
    ],
    'PrestaShop': [
      /prestashop/i,
      /ps_/i
    ]
  };

  for (const [platform, patterns] of Object.entries(platforms)) {
    if (patterns.some(pattern => pattern.test(html))) {
      return platform;
    }
  }

  return 'Неизвестная платформа';
}

/**
 * Извлекает заголовок страницы
 */
function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  return titleMatch ? titleMatch[1].trim() : 'Заголовок не найден';
}

/**
 * Извлекает категории товаров
 */
function extractProductCategories(html) {
  const categories = [];
  
  // Поиск в навигации
  const navMatches = html.match(/<nav[^>]*>(.*?)<\/nav>/gis) || [];
  navMatches.forEach(nav => {
    const links = nav.match(/<a[^>]*>(.*?)<\/a>/gis) || [];
    links.forEach(link => {
      const text = link.replace(/<[^>]*>/g, '').trim();
      if (text.length > 2 && text.length < 30) {
        categories.push(text);
      }
    });
  });

  // Поиск в каталоге
  const catalogMatches = html.match(/каталог|категори|товар|продукц/gi) || [];
  
  return [...new Set(categories)].slice(0, 10);
}

/**
 * Извлекает контактную информацию
 */
function extractContacts(html) {
  const contacts = {
    emails: [],
    phones: [],
    addresses: []
  };

  // Email
  const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  contacts.emails = [...new Set(emailMatches)].slice(0, 5);

  // Телефоны
  const phoneMatches = html.match(/\+?\d[\d\s\-\(\)]{7,}/g) || [];
  contacts.phones = [...new Set(phoneMatches)].slice(0, 5);

  // Адреса (упрощенно)
  const addressKeywords = /адрес|address|город|улица|дом/gi;
  if (addressKeywords.test(html)) {
    contacts.addresses.push('Адрес найден на сайте');
  }

  return contacts;
}

/**
 * Находит формы обратной связи
 */
function extractForms(html) {
  const forms = [];
  const formMatches = html.match(/<form[^>]*>(.*?)<\/form>/gis) || [];
  
  formMatches.forEach((form, index) => {
    const hasEmail = /email|почта/i.test(form);
    const hasPhone = /phone|телефон/i.test(form);
    const hasMessage = /message|сообщение|текст/i.test(form);
    
    forms.push({
      id: index + 1,
      hasEmail,
      hasPhone,
      hasMessage,
      type: hasMessage ? 'Обратная связь' : 'Подписка'
    });
  });

  return forms;
}

/**
 * Находит способы оплаты
 */
function extractPaymentMethods(html) {
  const methods = [];
  const paymentKeywords = {
    'СБП': /сбп|система быстрых платежей/i,
    'Тинькофф': /тинькофф|tinkoff/i,
    'Сбербанк': /сбербанк|sberbank/i,
    'ЮMoney': /юmoney|yandex\.money/i,
    'QIWI': /qiwi|киви/i,
    'WebMoney': /webmoney|вебмани/i,
    'PayPal': /paypal/i,
    'Visa/MasterCard': /visa|mastercard|банковск/i
  };

  for (const [method, pattern] of Object.entries(paymentKeywords)) {
    if (pattern.test(html)) {
      methods.push(method);
    }
  }

  return methods;
}

/**
 * SEO анализ
 */
async function analyzeSEO(html) {
  console.log('🔍 [SEO] Проводим SEO анализ...');
  
  const seo = {
    title: analyzeTitleTag(html),
    metaDescription: analyzeMetaDescription(html),
    headings: analyzeHeadings(html),
    images: analyzeImages(html),
    internalLinks: analyzeInternalLinks(html),
    score: 0
  };

  // Подсчет общего SEO балла
  seo.score = calculateSEOScore(seo);
  
  console.log(`✅ [SEO] SEO анализ завершен. Балл: ${seo.score}/100`);
  return seo;
}

/**
 * Анализ title тега
 */
function analyzeTitleTag(html) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  return {
    exists: !!title,
    content: title,
    length: title.length,
    optimal: title.length >= 30 && title.length <= 60,
    issues: title.length === 0 ? ['Отсутствует title'] : 
            title.length < 30 ? ['Title слишком короткий'] :
            title.length > 60 ? ['Title слишком длинный'] : []
  };
}

/**
 * Анализ meta description
 */
function analyzeMetaDescription(html) {
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  const description = descMatch ? descMatch[1].trim() : '';
  
  return {
    exists: !!description,
    content: description,
    length: description.length,
    optimal: description.length >= 120 && description.length <= 160,
    issues: description.length === 0 ? ['Отсутствует meta description'] :
            description.length < 120 ? ['Description слишком короткий'] :
            description.length > 160 ? ['Description слишком длинный'] : []
  };
}

/**
 * Анализ структуры заголовков
 */
function analyzeHeadings(html) {
  const headings = {
    h1: (html.match(/<h1[^>]*>/gi) || []).length,
    h2: (html.match(/<h2[^>]*>/gi) || []).length,
    h3: (html.match(/<h3[^>]*>/gi) || []).length,
    h4: (html.match(/<h4[^>]*>/gi) || []).length,
    h5: (html.match(/<h5[^>]*>/gi) || []).length,
    h6: (html.match(/<h6[^>]*>/gi) || []).length
  };

  const issues = [];
  if (headings.h1 === 0) issues.push('Отсутствует H1');
  if (headings.h1 > 1) issues.push('Несколько H1 на странице');
  if (headings.h2 === 0) issues.push('Отсутствуют H2');

  return {
    structure: headings,
    issues,
    optimal: headings.h1 === 1 && headings.h2 > 0
  };
}

/**
 * Анализ изображений
 */
function analyzeImages(html) {
  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = images.filter(img => /alt\s*=\s*["'][^"']*["']/i.test(img));
  const imagesWithoutAlt = images.length - imagesWithAlt.length;

  return {
    total: images.length,
    withAlt: imagesWithAlt.length,
    withoutAlt: imagesWithoutAlt,
    altOptimization: images.length > 0 ? Math.round((imagesWithAlt.length / images.length) * 100) : 0,
    issues: imagesWithoutAlt > 0 ? [`${imagesWithoutAlt} изображений без alt-атрибута`] : []
  };
}

/**
 * Анализ внутренних ссылок
 */
function analyzeInternalLinks(html) {
  const allLinks = html.match(/<a[^>]*href\s*=\s*["']([^"']*)["'][^>]*>/gi) || [];
  const internalLinks = allLinks.filter(link => {
    const href = link.match(/href\s*=\s*["']([^"']*)["']/i);
    return href && !href[1].startsWith('http') && !href[1].startsWith('mailto');
  });

  return {
    total: allLinks.length,
    internal: internalLinks.length,
    external: allLinks.length - internalLinks.length,
    ratio: allLinks.length > 0 ? Math.round((internalLinks.length / allLinks.length) * 100) : 0
  };
}

/**
 * Анализ мобильной оптимизации
 */
async function analyzeMobileOptimization(html) {
  console.log('📱 [SEO] Анализируем мобильную оптимизацию...');
  
  const mobile = {
    viewport: analyzeViewport(html),
    responsiveImages: analyzeResponsiveImages(html),
    touchElements: analyzeTouchElements(html),
    score: 0
  };

  mobile.score = calculateMobileScore(mobile);
  
  console.log(`✅ [SEO] Мобильный анализ завершен. Балл: ${mobile.score}/100`);
  return mobile;
}

/**
 * Анализ viewport meta тега
 */
function analyzeViewport(html) {
  const viewportMatch = html.match(/<meta[^>]*name="viewport"[^>]*content="([^"]*)"[^>]*>/i);
  const hasViewport = !!viewportMatch;
  const content = viewportMatch ? viewportMatch[1] : '';
  
  const hasWidth = /width\s*=\s*device-width/i.test(content);
  const hasInitialScale = /initial-scale\s*=\s*1/i.test(content);

  return {
    exists: hasViewport,
    content,
    hasWidth,
    hasInitialScale,
    optimal: hasViewport && hasWidth && hasInitialScale,
    issues: !hasViewport ? ['Отсутствует viewport meta тег'] :
            !hasWidth || !hasInitialScale ? ['Неоптимальные настройки viewport'] : []
  };
}

/**
 * Анализ адаптивных изображений
 */
function analyzeResponsiveImages(html) {
  const images = html.match(/<img[^>]*>/gi) || [];
  const responsiveImages = images.filter(img => 
    /srcset|sizes/i.test(img) || /class\s*=\s*["'][^"']*responsive[^"']*["']/i.test(img)
  );

  return {
    total: images.length,
    responsive: responsiveImages.length,
    optimization: images.length > 0 ? Math.round((responsiveImages.length / images.length) * 100) : 0
  };
}

/**
 * Анализ элементов для касания
 */
function analyzeTouchElements(html) {
  const buttons = html.match(/<button[^>]*>/gi) || [];
  const links = html.match(/<a[^>]*>/gi) || [];
  
  // Простая проверка на размер кнопок (через стили)
  const smallElements = html.match(/font-size\s*:\s*[0-9]+(px|em|rem)/gi) || [];
  const smallCount = smallElements.filter(style => {
    const size = parseInt(style.match(/\d+/)[0]);
    return size < 14; // Считаем мелким если меньше 14px
  }).length;

  return {
    buttons: buttons.length,
    links: links.length,
    smallElements: smallCount,
    issues: smallCount > 5 ? ['Найдены мелкие элементы интерфейса'] : []
  };
}

/**
 * Анализ контента
 */
async function analyzeContent(html) {
  console.log('📝 [SEO] Анализируем контент...');
  
  const textContent = extractTextContent(html);
  const words = textContent.split(/\s+/).filter(word => word.length > 2);
  
  return {
    wordCount: words.length,
    readability: analyzeReadability(textContent),
    duplicateContent: analyzeDuplicateContent(html),
    structure: analyzeContentStructure(html)
  };
}

/**
 * Анализ технических аспектов
 */
async function analyzeTechnology(html, url) {
  console.log('⚙️ [SEO] Анализируем технические аспекты...');
  
  return {
    loadSpeed: await analyzeLoadSpeed(url),
    security: analyzeSecurityFeatures(html, url),
    structured: analyzeStructuredData(html)
  };
}

/**
 * Генерация рекомендаций
 */
function generateRecommendations(analysis) {
  console.log('💡 [SEO] Генерируем рекомендации...');
  
  const recommendations = [];
  const { basicInfo, seoAnalysis, mobileAnalysis, contentAnalysis } = analysis;

  // SEO рекомендации
  if (seoAnalysis.title.issues.length > 0) {
    recommendations.push({
      category: 'SEO',
      priority: 'высокий',
      issue: 'Проблемы с title тегом',
      recommendation: seoAnalysis.title.issues.join(', '),
      action: 'Оптимизировать title: 30-60 символов, уникальный для каждой страницы'
    });
  }

  if (seoAnalysis.metaDescription.issues.length > 0) {
    recommendations.push({
      category: 'SEO',
      priority: 'высокий',
      issue: 'Проблемы с meta description',
      recommendation: seoAnalysis.metaDescription.issues.join(', '),
      action: 'Добавить meta description: 120-160 символов, призыв к действию'
    });
  }

  if (seoAnalysis.images.withoutAlt > 0) {
    recommendations.push({
      category: 'SEO',
      priority: 'средний',
      issue: 'Изображения без alt атрибутов',
      recommendation: `${seoAnalysis.images.withoutAlt} изображений без описания`,
      action: 'Добавить alt-теги ко всем изображениям для лучшей индексации'
    });
  }

  // Мобильные рекомендации
  if (!mobileAnalysis.viewport.optimal) {
    recommendations.push({
      category: 'Мобильность',
      priority: 'высокий',
      issue: 'Неоптимальная мобильная версия',
      recommendation: mobileAnalysis.viewport.issues.join(', '),
      action: 'Добавить: <meta name="viewport" content="width=device-width, initial-scale=1">'
    });
  }

  // Платформо-специфичные рекомендации
  if (basicInfo.platform === 'Tilda') {
    recommendations.push({
      category: 'Платформа',
      priority: 'низкий',
      issue: 'Возможности Tilda',
      recommendation: 'Сайт на Tilda - много возможностей для улучшения',
      action: 'Добавить pop-up в Zero Block, настроить аналитику, улучшить формы'
    });
  }

  // Контент рекомендации
  if (contentAnalysis.wordCount < 300) {
    recommendations.push({
      category: 'Контент',
      priority: 'средний',
      issue: 'Мало текстового контента',
      recommendation: `Только ${contentAnalysis.wordCount} слов на странице`,
      action: 'Добавить больше полезного контента: описания, отзывы, FAQ'
    });
  }

  // Общие рекомендации
  if (basicInfo.forms.length === 0) {
    recommendations.push({
      category: 'Конверсия',
      priority: 'средний',
      issue: 'Отсутствуют формы обратной связи',
      recommendation: 'Нет способов связаться с клиентами',
      action: 'Добавить формы: заказать звонок, подписка, обратная связь'
    });
  }

  console.log(`✅ [SEO] Сгенерировано ${recommendations.length} рекомендаций`);
  return recommendations;
}

/**
 * Подсчет общего балла
 */
function calculateOverallScore(analysis) {
  const { seoAnalysis, mobileAnalysis, contentAnalysis } = analysis;
  
  const seoWeight = 0.4;
  const mobileWeight = 0.3;
  const contentWeight = 0.3;
  
  const totalScore = Math.round(
    (seoAnalysis.score * seoWeight) +
    (mobileAnalysis.score * mobileWeight) +
    (contentAnalysis.wordCount > 300 ? 80 : 50) * contentWeight
  );
  
  return Math.min(totalScore, 100);
}

/**
 * Подсчет SEO балла
 */
function calculateSEOScore(seo) {
  let score = 0;
  
  // Title (25 баллов)
  if (seo.title.optimal) score += 25;
  else if (seo.title.exists) score += 10;
  
  // Meta description (25 баллов)
  if (seo.metaDescription.optimal) score += 25;
  else if (seo.metaDescription.exists) score += 10;
  
  // Заголовки (25 баллов)
  if (seo.headings.optimal) score += 25;
  else if (seo.headings.structure.h1 > 0) score += 15;
  
  // Изображения (25 баллов)
  score += Math.round((seo.images.altOptimization / 100) * 25);
  
  return score;
}

/**
 * Подсчет мобильного балла
 */
function calculateMobileScore(mobile) {
  let score = 0;
  
  // Viewport (50 баллов)
  if (mobile.viewport.optimal) score += 50;
  else if (mobile.viewport.exists) score += 25;
  
  // Адаптивные изображения (30 баллов)
  score += Math.round((mobile.responsiveImages.optimization / 100) * 30);
  
  // Элементы касания (20 баллов)
  if (mobile.touchElements.issues.length === 0) score += 20;
  else score += 10;
  
  return score;
}

/**
 * Форматирование отчета в Markdown
 */
function formatReportMarkdown(report) {
  const { basicInfo, seoAnalysis, mobileAnalysis, recommendations, overallScore } = report;
  
  let markdown = `# 📊 SEO Анализ сайта\n\n`;
  markdown += `🔗 **Сайт:** ${report.url}\n`;
  markdown += `📅 **Дата:** ${new Date(report.timestamp).toLocaleDateString('ru-RU')}\n`;
  markdown += `🎯 **Общий балл:** ${overallScore}/100 ${getScoreEmoji(overallScore)}\n\n`;
  
  // Базовая информация
  markdown += `## 🏢 Основная информация\n\n`;
  markdown += `📦 **Платформа:** ${basicInfo.platform}\n`;
  markdown += `📋 **Заголовок:** ${basicInfo.title}\n`;
  
  if (basicInfo.categories.length > 0) {
    markdown += `🏷️ **Категории:** ${basicInfo.categories.slice(0, 5).join(', ')}\n`;
  }
  
  if (basicInfo.contacts.emails.length > 0) {
    markdown += `📧 **Email:** ${basicInfo.contacts.emails[0]}\n`;
  }
  
  if (basicInfo.contacts.phones.length > 0) {
    markdown += `📞 **Телефон:** ${basicInfo.contacts.phones[0]}\n`;
  }
  
  if (basicInfo.paymentMethods.length > 0) {
    markdown += `💳 **Оплата:** ${basicInfo.paymentMethods.join(', ')}\n`;
  }
  
  // SEO анализ
  markdown += `\n## 🔍 SEO Анализ (${seoAnalysis.score}/100)\n\n`;
  
  if (seoAnalysis.title.exists) {
    markdown += `✅ **Title:** ${seoAnalysis.title.optimal ? 'Оптимален' : 'Требует улучшения'} (${seoAnalysis.title.length} символов)\n`;
  } else {
    markdown += `❌ **Title:** Отсутствует\n`;
  }
  
  if (seoAnalysis.metaDescription.exists) {
    markdown += `✅ **Meta Description:** ${seoAnalysis.metaDescription.optimal ? 'Оптимален' : 'Требует улучшения'} (${seoAnalysis.metaDescription.length} символов)\n`;
  } else {
    markdown += `❌ **Meta Description:** Отсутствует\n`;
  }
  
  markdown += `📊 **Заголовки:** H1: ${seoAnalysis.headings.structure.h1}, H2: ${seoAnalysis.headings.structure.h2}\n`;
  markdown += `🖼️ **Изображения:** ${seoAnalysis.images.total} шт., с alt: ${seoAnalysis.images.altOptimization}%\n`;
  
  // Мобильная оптимизация
  markdown += `\n## 📱 Мобильная оптимизация (${mobileAnalysis.score}/100)\n\n`;
  markdown += `${mobileAnalysis.viewport.optimal ? '✅' : '❌'} **Viewport:** ${mobileAnalysis.viewport.optimal ? 'Настроен' : 'Требует настройки'}\n`;
  markdown += `📸 **Адаптивные изображения:** ${mobileAnalysis.responsiveImages.optimization}%\n`;
  
  // Рекомендации
  markdown += `\n## 💡 Рекомендации\n\n`;
  
  const highPriority = recommendations.filter(r => r.priority === 'высокий');
  const mediumPriority = recommendations.filter(r => r.priority === 'средний');
  const lowPriority = recommendations.filter(r => r.priority === 'низкий');
  
  if (highPriority.length > 0) {
    markdown += `### 🔥 Высокий приоритет\n`;
    highPriority.forEach((rec, index) => {
      markdown += `${index + 1}. **${rec.issue}** - ${rec.action}\n`;
    });
    markdown += `\n`;
  }
  
  if (mediumPriority.length > 0) {
    markdown += `### ⚡ Средний приоритет\n`;
    mediumPriority.forEach((rec, index) => {
      markdown += `${index + 1}. **${rec.issue}** - ${rec.action}\n`;
    });
    markdown += `\n`;
  }
  
  if (lowPriority.length > 0) {
    markdown += `### 💫 Дополнительно\n`;
    lowPriority.forEach((rec, index) => {
      markdown += `${index + 1}. **${rec.issue}** - ${rec.action}\n`;
    });
  }
  
  // Итоговая оценка
  markdown += `\n## 🎯 Итоговая оценка\n\n`;
  if (overallScore >= 80) {
    markdown += `🚀 **Отличный результат!** Ваш сайт хорошо оптимизирован.\n`;
  } else if (overallScore >= 60) {
    markdown += `⚡ **Хороший результат!** Есть возможности для улучшения.\n`;
  } else if (overallScore >= 40) {
    markdown += `💪 **Требует работы.** Много возможностей для оптимизации.\n`;
  } else {
    markdown += `🔥 **Срочно нужна оптимизация!** Критические проблемы с SEO.\n`;
  }
  
  return markdown;
}

/**
 * Эмодзи для оценки
 */
function getScoreEmoji(score) {
  if (score >= 80) return '🚀';
  if (score >= 60) return '⚡';
  if (score >= 40) return '💪';
  return '🔥';
}

// Вспомогательные функции для детального анализа
function analyzeReadability(text) {
  const sentences = text.split(/[.!?]+/).length;
  const words = text.split(/\s+/).length;
  const avgWordsPerSentence = sentences > 0 ? Math.round(words / sentences) : 0;
  
  return {
    avgWordsPerSentence,
    readabilityLevel: avgWordsPerSentence < 15 ? 'легкий' : 
                     avgWordsPerSentence < 25 ? 'средний' : 'сложный'
  };
}

function analyzeDuplicateContent(html) {
  // Простая проверка на дублированный контент
  const textBlocks = html.match(/<p[^>]*>(.*?)<\/p>/gis) || [];
  const uniqueBlocks = [...new Set(textBlocks)];
  const duplicateRatio = textBlocks.length > 0 ? 
    Math.round(((textBlocks.length - uniqueBlocks.length) / textBlocks.length) * 100) : 0;
  
  return {
    duplicateRatio,
    hasDuplicates: duplicateRatio > 10
  };
}

function analyzeContentStructure(html) {
  const paragraphs = (html.match(/<p[^>]*>/gi) || []).length;
  const lists = (html.match(/<ul[^>]*>|<ol[^>]*>/gi) || []).length;
  const tables = (html.match(/<table[^>]*>/gi) || []).length;
  
  return {
    paragraphs,
    lists,
    tables,
    wellStructured: paragraphs > 3 && lists > 0
  };
}

async function analyzeLoadSpeed(url) {
  // Упрощенная проверка скорости загрузки
  const startTime = Date.now();
  try {
    await fetch(url, { method: 'HEAD', timeout: 5000 });
    const loadTime = Date.now() - startTime;
    return {
      loadTime,
      rating: loadTime < 1000 ? 'отлично' : 
              loadTime < 3000 ? 'хорошо' : 
              loadTime < 5000 ? 'средне' : 'медленно'
    };
  } catch (error) {
    return {
      loadTime: 5000,
      rating: 'ошибка измерения',
      error: error.message
    };
  }
}

function analyzeSecurityFeatures(html, url) {
  return {
    https: url.startsWith('https'),
    hasSSL: url.startsWith('https'),
    securityHeaders: html.includes('Content-Security-Policy') || html.includes('X-Frame-Options')
  };
}

function analyzeStructuredData(html) {
  const jsonLd = (html.match(/<script[^>]*type="application\/ld\+json"[^>]*>/gi) || []).length;
  const microdata = html.includes('itemscope') || html.includes('itemtype');
  const openGraph = html.includes('og:') || html.includes('property="og:');
  
  return {
    jsonLd: jsonLd > 0,
    microdata,
    openGraph,
    hasStructuredData: jsonLd > 0 || microdata || openGraph
  };
}

module.exports = {
  analyzeSiteComprehensive,
  detectPlatform,
  extractBasicInfo,
  analyzeSEO,
  analyzeMobileOptimization
};
