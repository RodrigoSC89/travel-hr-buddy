#!/usr/bin/env node
/**
 * Image Optimization Script - FASE A.4
 * 
 * Otimiza imagens grandes convertendo para WebP e criando versões responsivas
 * Meta: 4.5MB → 500KB (-89%)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuração de tamanhos responsivos
const SIZES = {
  small: 400,
  medium: 800,
};

// Imagens a serem otimizadas
const IMAGES = [
  'src/assets/nautilus-logo.png',
  'src/assets/nautilus-logo-new.png',
  'public/nautilus-logo.png',
];

// Estatísticas
const stats = {
  before: 0,
  after: 0,
  files: [],
};

async function optimizeImage(imagePath) {
  console.log(`\n🔧 Otimizando: ${imagePath}`);
  
  const dir = path.dirname(imagePath);
  const basename = path.basename(imagePath, path.extname(imagePath));
  
  // Obter tamanho original
  const originalSize = fs.statSync(imagePath).size;
  stats.before += originalSize;
  
  console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  
  const fileStats = {
    original: imagePath,
    originalSize: originalSize,
    versions: [],
  };
  
  // Criar versões responsivas em WebP
  for (const [size, width] of Object.entries(SIZES)) {
    const outputPath = path.join(dir, `${basename}-${size}.webp`);
    
    await sharp(imagePath)
      .resize(width, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 68,
        effort: 6,
      })
      .toFile(outputPath);
    
    const newSize = fs.statSync(outputPath).size;
    stats.after += newSize;
    
    fileStats.versions.push({
      size,
      path: outputPath,
      size: newSize,
      reduction: ((1 - newSize / originalSize) * 100).toFixed(1) + '%',
    });
    
    console.log(`   ✓ ${size.padEnd(6)}: ${(newSize / 1024).toFixed(0)} KB (-${((1 - newSize / originalSize) * 100).toFixed(1)}%)`);
  }
  
  stats.files.push(fileStats);
}

async function main() {
  console.log('🖼️  FASE A.4 - Image Optimization');
  console.log('=' .repeat(60));
  
  for (const imagePath of IMAGES) {
    if (fs.existsSync(imagePath)) {
      await optimizeImage(imagePath);
    } else {
      console.log(`⚠️  Imagem não encontrada: ${imagePath}`);
    }
  }
  
  console.log('\n📊 RESUMO GERAL');
  console.log('=' .repeat(60));
  console.log(`Total original: ${(stats.before / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total otimizado: ${(stats.after / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Redução: ${((1 - stats.after / stats.before) * 100).toFixed(1)}%`);
  console.log(`Meta atingida: ${stats.after < 500 * 1024 ? '✓' : '✗'} (${(stats.after / 1024).toFixed(0)} KB / 500 KB)`);
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    totalBefore: stats.before,
    totalAfter: stats.after,
    reductionPercent: ((1 - stats.after / stats.before) * 100).toFixed(1),
    files: stats.files,
  };
  
  fs.writeFileSync(
    'image-optimization-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✓ Relatório salvo em: image-optimization-report.json');
}

main().catch(console.error);
