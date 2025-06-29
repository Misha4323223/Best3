
/**
 * API роуты для SEO анализатора сайтов
 */

const express = require('express');
const { analyzeSiteComprehensive } = require('./seo-website-analyzer');

const router = express.Router();

/**
 * POST /api/seo/analyze
 * Полный анализ сайта
 */
router.post('/analyze', async (req, res) => {
  console.log('📊 [SEO API] Получен запрос на анализ сайта');
  
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL сайта обязателен'
      });
    }

    // Валидация URL
    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный URL'
      });
    }

    console.log(`📊 [SEO API] Начинаем анализ: ${url}`);
    
    // Запускаем анализ
    const result = await analyzeSiteComprehensive(url);
    
    if (result.success) {
      console.log(`✅ [SEO API] Анализ завершен успешно. Балл: ${result.report.overallScore}/100`);
      res.json({
        success: true,
        data: result.report,
        formattedReport: result.formattedReport,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`❌ [SEO API] Ошибка анализа: ${result.error}`);
      res.status(500).json({
        success: false,
        error: result.error,
        url
      });
    }

  } catch (error) {
    console.error('❌ [SEO API] Критическая ошибка:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: error.message
    });
  }
});

/**
 * GET /api/seo/quick-check/:domain
 * Быстрая проверка основных SEO параметров
 */
router.get('/quick-check/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    
    console.log(`⚡ [SEO API] Быстрая проверка: ${url}`);
    
    // Упрощенный анализ только основных параметров
    const result = await quickSEOCheck(url);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [SEO API] Ошибка быстрой проверки:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Быстрая SEO проверка (упрощенная версия)
 */
async function quickSEOCheck(url) {
  const fetch = require('node-fetch');
  const https = require('https');
  
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false
  });

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Bot/1.0)'
      },
      timeout: 10000,
      agent: url.startsWith('https:') ? httpsAgent : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Быстрые проверки
    const title = html.match(/<title[^>]*>(.*?)<\/title>/is);
    const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    const viewport = html.match(/<meta[^>]*name="viewport"/i);
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    const images = html.match(/<img[^>]*>/gi) || [];
    const imagesWithAlt = images.filter(img => /alt\s*=/i.test(img));

    return {
      url,
      title: {
        exists: !!title,
        length: title ? title[1].length : 0,
        content: title ? title[1].substring(0, 100) : null
      },
      metaDescription: {
        exists: !!metaDesc,
        length: metaDesc ? metaDesc[1].length : 0
      },
      mobile: {
        hasViewport: !!viewport
      },
      headings: {
        h1Count
      },
      images: {
        total: images.length,
        withAlt: imagesWithAlt.length,
        altPercentage: images.length > 0 ? Math.round((imagesWithAlt.length / images.length) * 100) : 0
      },
      loadTime: response.loadTime || 'unknown'
    };

  } catch (error) {
    throw new Error(`Ошибка загрузки сайта: ${error.message}`);
  }
}

/**
 * Валидация URL
 */
function isValidUrl(string) {
  try {
    const url = new URL(string.startsWith('http') ? string : `https://${string}`);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

module.exports = router;
