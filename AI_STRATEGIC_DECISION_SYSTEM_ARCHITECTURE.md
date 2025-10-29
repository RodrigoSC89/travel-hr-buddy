# AI Strategic Decision System - Visual Architecture

## System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AI STRATEGIC DECISION SYSTEM                        │
│                          (PATCHES 581-585)                              │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │   SIGNALS    │
                            │   (PATCH 581)│
                            └──────┬───────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
    ┌───▼───┐               ┌──────▼──────┐          ┌──────▼──────┐
    │  BI   │               │ Situational │          │   Manual/   │
    │Analytics              │  Awareness  │          │   Sensor    │
    └───────┘               └─────────────┘          └─────────────┘

                                   │
                                   ▼
           ┌────────────────────────────────────────────────┐
           │  PATCH 581: Predictive Strategy Engine        │
           │  • Receives signals from multiple sources      │
           │  • Generates 3+ distinct strategies           │
           │  • Assigns success probabilities & scores     │
           │  • Continuous learning with feedback          │
           │  • Logs all proposals to database             │
           └──────────────────┬─────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Generated Strategies        │
              │   (Min 3, typically 5)        │
              │   • Preventive                │
              │   • Reactive                  │
              │   • Optimization              │
              │   • Risk Mitigation           │
              │   • Resource Allocation       │
              └───────────────┬───────────────┘
                              │
                              ▼
           ┌────────────────────────────────────────────────┐
           │  PATCH 582: Decision Simulator Core            │
           │  • Monte Carlo simulation (1000+ iterations)   │
           │  • Multiple scenarios (best/expected/worst)    │
           │  • Metrics: Cost, Risk, Time, Crew Impact      │
           │  • Confidence level calculation                │
           │  • Mission-based archiving                     │
           └──────────────────┬─────────────────────────────┘
                              │
                              ▼
           ┌────────────────────────────────────────────────┐
           │    Simulation Results + Visualization          │
           │    • React UI Component                        │
           │    • Interactive metrics tabs                  │
           │    • Scenario details                          │
           │    • Warnings & recommendations                │
           └──────────────────┬─────────────────────────────┘
                              │
                              ▼
           ┌────────────────────────────────────────────────┐
           │  PATCH 583: Neural Governance Module           │
           │  • Ethical & legal validation                  │
           │  • 4 default policies (Safety, Financial,      │
           │    Ethical, Operational)                       │
           │  • Risk categorization (low → critical)        │
           │  • Veto system with override capability        │
           │  • Complete audit trail                        │
           └──────────────────┬─────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Governance Evaluation       │
              │   • Approved ✓                │
              │   • Vetoed ✗                  │
              │   • Escalated ⚠               │
              │   • Conditional ⚡             │
              └───────────────┬───────────────┘
                              │
                              ▼
           ┌────────────────────────────────────────────────┐
           │  PATCH 584: Strategic Consensus Builder        │
           │  • 5 specialized AI agents                     │
           │    - Operational AI                            │
           │    - Safety AI                                 │
           │    - Financial AI                              │
           │    - Strategic AI                              │
           │    - Risk Management AI                        │
           │  • Weighted confidence voting                  │
           │  • Disagreement detection & logging            │
           │  • 5 fallback rules for deadlock               │
           └──────────────────┬─────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Consensus Result            │
              │   • Status (achieved/partial) │
              │   • Consensus Score (0-100)   │
              │   • Support Level (-100/+100) │
              │   • Final Decision            │
              │     - Proceed ✓               │
              │     - Reject ✗                │
              │     - Modify ↻                │
              │     - Escalate ⬆              │
              └───────────────┬───────────────┘
                              │
                              ▼
           ┌────────────────────────────────────────────────┐
           │  PATCH 585: Executive Summary Generator        │
           │  • Consolidates all AI decisions               │
           │  • Natural language insights generation        │
           │  • Strategic recommendations                   │
           │  • Key metrics dashboard                       │
           │  • Export to PDF (jsPDF) & JSON                │
           │  • Mission-based filtering                     │
           └──────────────────┬─────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Executive Summary           │
              │   • Overview statistics       │
              │   • AI-generated insights     │
              │   • Recommendations           │
              │   • Exportable reports        │
              └───────────────┬───────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   DECISION      │
                    │   Execute or    │
                    │   Review        │
                    └─────────────────┘
```

## Data Flow

```
Signal Reception → Strategy Generation → Simulation → Governance → Consensus → Summary
     ↓                    ↓                  ↓            ↓            ↓          ↓
 Database           Database          Database     Database     Database   Database
   Logs               Logs              Logs         Logs         Logs       Logs
```

## Module Interaction Matrix

```
┌──────────────┬────────┬────────┬──────────┬──────────┬──────────┐
│              │ PATCH  │ PATCH  │  PATCH   │  PATCH   │  PATCH   │
│              │  581   │  582   │   583    │   584    │   585    │
├──────────────┼────────┼────────┼──────────┼──────────┼──────────┤
│ PATCH 581    │   -    │  Uses  │   Uses   │   Uses   │   Uses   │
│ Strategy     │        │ Output │  Output  │  Output  │  Output  │
├──────────────┼────────┼────────┼──────────┼──────────┼──────────┤
│ PATCH 582    │ Needs  │   -    │  Feeds   │  Feeds   │   Uses   │
│ Simulator    │ Input  │        │   Into   │   Into   │  Output  │
├──────────────┼────────┼────────┼──────────┼──────────┼──────────┤
│ PATCH 583    │ Needs  │ Uses   │    -     │ Informs  │   Uses   │
│ Governance   │ Input  │ Input  │          │          │  Output  │
├──────────────┼────────┼────────┼──────────┼──────────┼──────────┤
│ PATCH 584    │ Needs  │  Can   │  Checks  │    -     │   Uses   │
│ Consensus    │ Input  │  Use   │   With   │          │  Output  │
├──────────────┼────────┼────────┼──────────┼──────────┼──────────┤
│ PATCH 585    │ Reads  │ Reads  │  Reads   │  Reads   │    -     │
│ Summary      │  All   │  All   │   All    │   All    │          │
└──────────────┴────────┴────────┴──────────┴──────────┴──────────┘
```

## Agent Consensus Process

```
                    ┌──────────────────────┐
                    │    Strategy Input    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┴────────────────┐
              │    Agent Selection (5 agents)   │
              └────────────────┬────────────────┘
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                           │
    ┌────▼────┐  ┌────────┐  ┌──────────┐  ┌───────▼───┐  ┌─────────┐
    │Operation│  │ Safety │  │Financial │  │Strategic  │  │  Risk   │
    │   AI    │  │   AI   │  │    AI    │  │    AI     │  │Mgmt AI  │
    └────┬────┘  └────┬───┘  └────┬─────┘  └─────┬─────┘  └────┬────┘
         │            │            │              │             │
         │ Vote       │ Vote       │ Vote         │ Vote        │ Vote
         │ (70-90)    │ (85-95)    │ (75-90)      │ (70-85)     │ (80-90)
         │            │            │              │             │
         └────────────┴────────────┴──────────────┴─────────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Weighted Voting     │
                    │  • Confidence scores │
                    │  • Agent weights     │
                    │  • Priority factors  │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Consensus Achieved? │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
            ┌───▼───┐      ┌───▼────┐    ┌───▼────┐
            │  YES  │      │PARTIAL │    │   NO   │
            │ >80%  │      │ 60-80% │    │  <60%  │
            └───┬───┘      └───┬────┘    └───┬────┘
                │              │              │
                ▼              ▼              ▼
            Proceed       Modify        Apply Fallback
                                           Rules
```

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE STRUCTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PATCH 581 Tables                                           │
│  ├─ ai_strategy_signals          (Signal reception)         │
│  ├─ ai_strategy_proposals        (Strategy proposals)       │
│  ├─ ai_strategies                (Individual strategies)    │
│  └─ ai_strategy_feedback         (Learning data)            │
│                                                             │
│  PATCH 582 Tables                                           │
│  └─ ai_simulations               (Simulation results)       │
│                                                             │
│  PATCH 583 Tables                                           │
│  ├─ ai_governance_evaluations    (Governance decisions)     │
│  ├─ ai_governance_vetoes         (Veto records)             │
│  └─ ai_governance_audit          (Audit trail)              │
│                                                             │
│  PATCH 584 Tables                                           │
│  ├─ ai_consensus_results         (Consensus outcomes)       │
│  └─ ai_agent_disagreements       (Disagreement logs)        │
│                                                             │
│  PATCH 585 Tables                                           │
│  └─ ai_executive_summaries       (Generated summaries)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

```
┌────────────────────────────────────────────────────────────┐
│              EXTERNAL SYSTEM INTEGRATION                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Input Sources                                             │
│  ├─ Situational Awareness System → Signals                │
│  ├─ BI Analytics System         → Signals                 │
│  ├─ Sensor Networks             → Signals                 │
│  └─ Manual Input                → Signals                 │
│                                                            │
│  Data Storage                                              │
│  └─ Supabase Database          → All modules              │
│                                                            │
│  User Interface                                            │
│  ├─ React Components           → Visualization            │
│  └─ Dashboard Integration      → Executive Summary        │
│                                                            │
│  Export Systems                                            │
│  ├─ PDF Generator (jsPDF)      → Reports                  │
│  └─ JSON Export                → Data integration         │
│                                                            │
│  Logging & Monitoring                                      │
│  ├─ Console (Development)      → All modules              │
│  ├─ Sentry (Production)        → Error tracking           │
│  └─ File System                → Consensus logs           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Layer 1: Input Validation                                 │
│  • Signal validation                                       │
│  • Parameter sanitization                                  │
│  • Type checking (TypeScript)                              │
│                                                            │
│  Layer 2: Governance & Policies                            │
│  • 4 default policies (Safety, Financial, etc.)            │
│  • Automatic violation detection                           │
│  • Risk categorization                                     │
│                                                            │
│  Layer 3: Approval Workflow                                │
│  • High-risk decision interception                         │
│  • Manual approval requirement                             │
│  • Veto system with override capability                    │
│                                                            │
│  Layer 4: Audit Trail                                      │
│  • Complete decision logging                               │
│  • Timestamp tracking                                      │
│  • User action recording                                   │
│                                                            │
│  Layer 5: Error Handling                                   │
│  • Try-catch blocks                                        │
│  • Meaningful error messages                               │
│  • Graceful degradation                                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Performance Considerations

```
┌────────────────────────────────────────────────────────────┐
│                  PERFORMANCE OPTIMIZATION                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Async Operations                                          │
│  • Simulations run asynchronously                          │
│  • Max 3 concurrent simulations                            │
│  • Non-blocking strategy generation                        │
│                                                            │
│  Caching                                                   │
│  • Evaluation cache (5 min TTL)                            │
│  • Strategy history cache                                  │
│  • Agent configuration cache                               │
│                                                            │
│  Database Optimization                                     │
│  • Indexes on frequently queried fields                    │
│  • Proper foreign key relationships                        │
│  • Batch inserts where possible                            │
│                                                            │
│  Configurable Parameters                                   │
│  • Monte Carlo iterations (adjustable)                     │
│  • Time horizon settings                                   │
│  • Uncertainty factor tuning                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Scalability Design

```
┌────────────────────────────────────────────────────────────┐
│                   SCALABILITY FEATURES                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Horizontal Scaling                                        │
│  • Stateless module design                                 │
│  • Database-backed state                                   │
│  • Load balancer compatible                                │
│                                                            │
│  Modular Architecture                                      │
│  • Independent module operation                            │
│  • Microservice-ready design                               │
│  • API-friendly interfaces                                 │
│                                                            │
│  Resource Management                                       │
│  • Configurable concurrency limits                         │
│  • Memory-efficient data structures                        │
│  • Cleanup of old cache entries                            │
│                                                            │
│  Future Expansion                                          │
│  • Plugin architecture support                             │
│  • Additional agent types possible                         │
│  • New strategy types extensible                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

*Visual Architecture Guide*
*AI Strategic Decision System (PATCHES 581-585)*
*Version 1.0*
