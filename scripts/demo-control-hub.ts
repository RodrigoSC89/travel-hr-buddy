/**
 * Control Hub Demo Script
 * 
 * Demonstrates the functionality of the Control Hub module.
 * Run with: npx tsx scripts/demo-control-hub.ts
 */

import { controlHub } from '../src/modules/control_hub/hub_core';
import hubMonitor from '../src/modules/control_hub/hub_monitor';
import hubSync from '../src/modules/control_hub/hub_sync';
import hubCache from '../src/modules/control_hub/hub_cache';
import hubBridge from '../src/modules/control_hub/hub_bridge';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function demo() {
  console.log('🔱 Nautilus Control Hub - Demo\n');
  console.log('═'.repeat(60));

  // 1. Initialize Control Hub
  console.log('\n1️⃣  Inicializando Control Hub...');
  try {
    await controlHub.iniciar();
    console.log('✅ Control Hub inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error);
  }

  await sleep(1000);

  // 2. Get Status
  console.log('\n2️⃣  Verificando status dos módulos...');
  try {
    const status = await hubMonitor.getStatus();
    console.log(`   Status Geral: ${status.overall}`);
    console.log(`   MMI: ${status.mmi.status}`);
    console.log(`   PEO-DP: ${status.peo_dp.status}`);
    console.log(`   DP Intelligence: ${status.dp_intelligence.status}`);
    console.log(`   BridgeLink: ${status.bridge_link.status}`);
    console.log(`   SGSO: ${status.sgso.status}`);
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
  }

  await sleep(1000);

  // 3. Check BridgeLink Connectivity
  console.log('\n3️⃣  Verificando conectividade BridgeLink...');
  try {
    const connected = await hubBridge.checkConnection();
    const bridgeStatus = hubBridge.getStatus();
    console.log(`   Conectado: ${connected ? '✅ Sim' : '❌ Não'}`);
    console.log(`   Latência: ${bridgeStatus.latencyMs}ms`);
    console.log(`   Qualidade: ${hubBridge.getConnectionQuality()}`);
  } catch (error) {
    console.error('❌ Erro ao verificar conexão:', error);
  }

  await sleep(1000);

  // 4. Store Data in Cache
  console.log('\n4️⃣  Armazenando dados no cache offline...');
  try {
    const testData = {
      timestamp: new Date(),
      module: 'demo',
      data: 'Test data for offline sync',
    };
    await controlHub.storeOffline(testData, 'mmi');
    console.log('✅ Dados armazenados no cache');
    console.log(`   Registros pendentes: ${hubSync.getPendingCount()}`);
    console.log(`   Tamanho do cache: ${hubCache.getCacheSizeMB().toFixed(2)} MB`);
  } catch (error) {
    console.error('❌ Erro ao armazenar dados:', error);
  }

  await sleep(1000);

  // 5. Synchronize
  console.log('\n5️⃣  Sincronizando com BridgeLink...');
  try {
    const result = await controlHub.sincronizar();
    console.log(`   Sucesso: ${result.success ? '✅' : '❌'}`);
    console.log(`   Registros enviados: ${result.recordsSent}`);
    console.log(`   Erros: ${result.errors.length}`);
  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error);
  }

  await sleep(1000);

  // 6. Get Dashboard Data
  console.log('\n6️⃣  Obtendo dados do dashboard...');
  try {
    const dashboardData = await controlHub.getDashboardData();
    console.log('   Dados do Dashboard:');
    console.log(`     Módulos: ${dashboardData.modules.overall}`);
    console.log(`     BridgeLink: ${dashboardData.bridge.connected ? 'Conectado' : 'Offline'}`);
    console.log(`     Cache pendente: ${dashboardData.cache.pending} registros`);
    console.log(`     Última sync: ${dashboardData.sync.lastSync?.toLocaleString('pt-BR') || 'Nunca'}`);
  } catch (error) {
    console.error('❌ Erro ao obter dados do dashboard:', error);
  }

  await sleep(1000);

  // 7. Check System Health
  console.log('\n7️⃣  Verificando saúde do sistema...');
  try {
    const health = await controlHub.getHealth();
    console.log(`   Status Geral: ${health.status}`);
    console.log(`   Módulos: ${health.details.modules}`);
    console.log(`   BridgeLink: ${health.details.bridge}`);
    console.log(`   Cache: ${health.details.cache}`);
  } catch (error) {
    console.error('❌ Erro ao verificar saúde:', error);
  }

  await sleep(1000);

  // 8. Get State
  console.log('\n8️⃣  Estado atual do Control Hub:');
  const state = controlHub.getState();
  console.log(`   Inicializado: ${state.initialized ? '✅' : '❌'}`);
  console.log(`   Registros pendentes: ${state.pendingRecords}`);
  console.log(`   BridgeLink conectado: ${state.bridgeLinkStatus.connected ? '✅' : '❌'}`);

  // 9. Display Alerts
  console.log('\n9️⃣  Alertas do sistema:');
  const alerts = hubMonitor.getAlerts();
  if (alerts.length === 0) {
    console.log('   ✅ Nenhum alerta');
  } else {
    alerts.forEach((alert) => console.log(`   ${alert}`));
  }

  // 10. Shutdown
  console.log('\n🔟 Encerrando Control Hub...');
  controlHub.shutdown();
  console.log('✅ Control Hub encerrado com sucesso');

  console.log('\n' + '═'.repeat(60));
  console.log('✨ Demo concluída com sucesso!\n');
}

// Run demo
demo().catch((error) => {
  console.error('❌ Erro fatal na demo:', error);
  process.exit(1);
});
