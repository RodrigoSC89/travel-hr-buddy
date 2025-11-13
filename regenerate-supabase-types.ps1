# Script para Regenerar Tipos do Supabase
# Execute este arquivo clicando com botão direito > "Executar com PowerShell"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Regenerando Tipos do Supabase..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navegar para o diretório do projeto
Set-Location "c:\Users\Rodrigo e Lais\Downloads\travel-hr-buddy"

Write-Host "📦 Instalando Supabase CLI se necessário..." -ForegroundColor Yellow
npm install -g supabase

Write-Host ""
Write-Host "🔄 Gerando tipos TypeScript..." -ForegroundColor Yellow

# Executar comando de geração de tipos
npx supabase gen types typescript --project-id vnbptmixvwropvanyhdb --schema public > src/integrations/supabase/types.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Tipos gerados com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Fazendo commit das mudanças..." -ForegroundColor Yellow
    
    git add src/integrations/supabase/types.ts
    git commit -m "chore: regenerate Supabase types after scheduled_tasks migration"
    git push origin main
    
    Write-Host ""
    Write-Host "✅ Tipos commitados e enviados para o GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✨ CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro ao gerar tipos. Verifique sua conexão com o Supabase." -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
