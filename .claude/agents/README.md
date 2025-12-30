# LoL Stonks RSS - Agent Orchestration System

Sistema completo di orchestrazione agenti per il progetto LoL Stonks RSS - un generatore di feed RSS per notizie di League of Legends con containerizzazione Docker per deployment su Windows Server.

## Panoramica

Questo sistema implementa un'architettura multi-agente dove agenti specializzati collaborano per completare task complessi. Ogni agente ha competenze specifiche e può essere invocato singolarmente o coordinato con altri agenti per workflow complessi.

## Filosofia del Sistema

### ⚠️ PARADIGMA FONDAMENTALE: Pura Delegazione

**Claude Code (l'assistente principale) NON fa MAI lavoro applicativo diretto.**

Il ruolo di Claude Code è quello di **orchestratore e coordinatore**, che:
- ✅ Analizza le richieste
- ✅ Decide quali agenti invocare
- ✅ Coordina l'esecuzione degli agenti
- ✅ Sintetizza i risultati
- ❌ NON scrive codice direttamente
- ❌ NON crea file
- ❌ NON fa configurazioni
- ❌ NON implementa nulla

**TUTTO il lavoro applicativo viene delegato agli agenti specializzati.**

## Architettura Agenti

### 🎯 Master Orchestrator
**File**: `master-orchestrator.md`

**IL DECISORE STRATEGICO** - L'agente che Claude Code usa come "cervello" per decidere quale/i agente/i invocare. Analizza task complessi, decide la strategia, delega agli specialisti.

**Quando usarlo**:
- Task complessi multi-dominio
- Incertezza su quale agente usare
- Coordinazione workflow complessi
- Sintesi risultati da agenti multipli

**IMPORTANTE**: Anche il master-orchestrator NON fa lavoro applicativo - solo analizza e delega.

### 🏗️ Architecture & Design

#### solution-architect
**File**: `solution-architect.md`

**IL CERVELLO ARCHITETTURALE** - Prende decisioni tecniche, sceglie tecnologie, progetta sistemi. Prima di implementare qualsiasi cosa significativa, consulta l'architetto.

**Quando usarlo**:
- Decisioni architetturali
- Scelta di tecnologie/framework
- Design di componenti sistema
- Analisi trade-off
- Standard tecnici

**Competenze**:
- System design
- Technology evaluation
- Design patterns
- Scalability planning
- Trade-off analysis

### 🔄 Meta-Orchestration Agents

#### 1. multi-agent-coordinator
**File**: `multi-agent-coordinator.md`

Specializzato nell'orchestrazione di workflow complessi con agenti multipli, gestione dipendenze, esecuzione parallela e fault tolerance.

**Quando usarlo**:
- Coordinare 3+ agenti simultaneamente
- Dipendenze complesse tra agenti
- Esecuzione parallela necessaria
- Workflow distribuiti

#### 2. agent-organizer
**File**: `agent-organizer.md`

Esperto nell'assemblare team di agenti, decomposizione task e ottimizzazione del workflow.

**Quando usarlo**:
- Scomporre requisiti complessi
- Assemblare team di agenti
- Mappare capacità ad agenti
- Ottimizzare collaborazione

#### 3. workflow-orchestrator
**File**: `workflow-orchestrator.md`

Specializzato nel design di processi complessi, implementazione state machine e automazione business process.

**Quando usarlo**:
- Progettare workflow CI/CD
- Implementare automazione processi
- Gestire stato workflow
- Costruire pipeline complesse

#### 4. task-distributor
**File**: `task-distributor.md`

Esperto nell'allocazione intelligente del lavoro, load balancing e gestione code.

**Quando usarlo**:
- Distribuire task tra agenti
- Bilanciamento del carico
- Gestione priorità
- Code di task multiple

### 💻 Core Development Agents

#### 5. python-pro
**File**: `python-pro.md`

Sviluppatore Python esperto specializzato in Python 3.11+, generazione RSS feed, programmazione async e web frameworks.

**Quando usarlo**:
- Implementazione Python
- Generazione feed RSS
- Integrazione API LoL
- Programmazione async
- Web service development

**Competenze**:
- RSS 2.0 XML generation
- FastAPI/Flask web services
- Async/await patterns
- Type hints e PEP 8
- pytest testing
- feedparser/feedgen

#### 6. devops-engineer
**File**: `devops-engineer.md`

Ingegnere DevOps specializzato in Docker, deployment Windows e automazione CI/CD.

**Quando usarlo**:
- Configurazione Docker
- Deployment Windows Server
- CI/CD pipeline setup
- Gestione infrastruttura
- Automazione deployment

**Competenze**:
- Docker optimization
- Windows container deployment
- CI/CD automation
- Environment management
- Health checks

#### 7. chrome-automation-expert
**File**: `chrome-automation-expert.md`

**ESPERTO WEB SCRAPING** - Specialista browser automation con accesso completo a Chrome DevTools MCP. Estrae notizie di League of Legends da web.

**Quando usarlo**:
- Web scraping (notizie LoL)
- Browser automation
- Estrazione contenuti
- Gestione contenuti dinamici
- Testing web pages

**Competenze**:
- Chrome DevTools MCP (tutti i tools)
- DOM navigation
- Network monitoring
- Dynamic content handling
- Screenshot & debugging

### ✅ Quality & Security Agents

#### 8. code-reviewer
**File**: `code-reviewer.md`

Esperto in code review, qualità del codice e best practices per Python e Docker.

**Quando usarlo**:
- Code review
- Security audit
- Quality check
- Best practices validation
- Analisi vulnerabilità

**Competenze**:
- Python code quality
- Docker security
- RSS specification compliance
- Security vulnerabilities
- Performance analysis

#### 9. qa-expert
**File**: `qa-expert.md`

Esperto QA specializzato in testing Python, validazione RSS feed e testing container Docker.

**Quando usarlo**:
- Strategia di testing
- Test automation
- Validazione RSS feed
- Quality metrics
- Performance testing

**Competenze**:
- pytest automation
- RSS 2.0 validation
- Integration testing
- Docker container testing
- Performance benchmarks

#### 10. rss-validator
**File**: `rss-validator.md`

**ESPERTO RSS** - Specialista validazione RSS 2.0/Atom compliance, struttura XML, encoding e compatibilità feed reader.

**Quando usarlo**:
- Validazione compliance RSS 2.0
- Verifica struttura XML
- Controllo encoding caratteri
- Test GUID uniqueness
- Compatibilità feed reader

**Competenze**:
- RSS 2.0 specification
- XML schema validation
- Character encoding (UTF-8)
- RFC 822 date validation
- Feed reader compatibility

### 🔒 Security & Compliance Agents

#### 11. security-auditor
**File**: `security-auditor.md`

Esperto security auditor specializzato in SOC 2, ISO 27001 e OWASP Top 10 compliance.

**Quando usarlo**:
- Security assessments
- Vulnerability analysis
- Compliance validation
- Risk assessment
- Security posture review

**Competenze**:
- OWASP Top 10
- SOC 2/ISO 27001
- Threat modeling
- Container security
- Application security

#### 12. security-engineer
**File**: `security-engineer.md`

DevSecOps engineer specializzato in remediation vulnerabilità, secrets detection e security automation.

**Quando usarlo**:
- Implementare fix sicurezza
- Integrare security tools
- Automatizzare security checks
- Remediation vulnerabilità

**Competenze**:
- Secrets detection
- Pre-commit hooks
- Security scanning
- Vulnerability remediation

#### 13. secrets-scanner
**File**: `secrets-scanner.md`

**CACCIATORE DI SECRETS** - Specialista rilevamento credenziali hardcoded, API keys, token in codice e git history.

**Quando usarlo**:
- Audit secrets nel codice
- Scansione git history
- Validazione pre-commit
- Assessment esposizione credenziali

**Competenze**:
- Pattern detection (API keys, tokens)
- Git history scanning
- Entropy analysis
- False positive reduction

#### 14. compliance-auditor
**File**: `compliance-auditor.md`

Esperto compliance SDLC, GitFlow validation e standards documentazione.

**Quando usarlo**:
- SDLC compliance audits
- GitFlow validation
- Documentation standards
- Process compliance
- Audit readiness

**Competenze**:
- GitFlow enforcement
- Conventional Commits
- Documentation standards
- Process governance

#### 15. git-workflow-manager
**File**: `git-workflow-manager.md`

Specialista GitFlow, branch protection e commit message validation.

**Quando usarlo**:
- GitFlow enforcement
- Branch cleanup
- Commit history maintenance
- PR workflow automation

**Competenze**:
- GitFlow best practices
- Conventional Commits
- Branch protection
- Git history management

### 🛠️ Specialized Agents

#### 16. refactoring-specialist
**File**: `refactoring-specialist.md`

Esperto code cleanup, dead code identification e technical debt reduction.

**Quando usarlo**:
- Identificazione dead code
- Code cleanup
- Ottimizzazione performance
- Riduzione technical debt

**Competenze**:
- Dead code analysis
- Safe refactoring
- Performance optimization
- Legacy code modernization

#### 17. dependency-manager
**File**: `dependency-manager.md`

Specialista dependency security, license compliance e version updates.

**Quando usarlo**:
- Security scanning dipendenze
- License compliance
- Version updates
- CVE monitoring

**Competenze**:
- Python packaging
- Dependency resolution
- Supply chain security
- License compliance

#### 18. documentation-auditor
**File**: `documentation-auditor.md`

Esperto qualità documentazione, completeness assessment e currency verification.

**Quando usarlo**:
- Audit documentazione
- Verifica completezza docs
- Cross-reference validation
- Code documentation review

**Competenze**:
- Documentation standards
- API documentation
- Docstring coverage
- Technical accuracy

#### 19. ci-cd-auditor
**File**: `ci-cd-auditor.md`

Specialista validazione pipeline CI/CD, GitHub Actions audit e automation coverage.

**Quando usarlo**:
- CI/CD audits
- Pipeline security review
- Automation gap analysis
- Deployment validation

**Competenze**:
- GitHub Actions
- Pipeline security
- Quality gates
- Git hooks compliance

#### 20. windows-deployment-validator
**File**: `windows-deployment-validator.md`

**ESPERTO WINDOWS** - Specialista deployment Windows Server, Docker Desktop validation e path handling.

**Quando usarlo**:
- Validazione deployment Windows
- Docker Desktop configuration
- Windows path compatibility
- PowerShell script review

**Competenze**:
- Docker Desktop for Windows
- Windows path handling
- PowerShell security
- Windows Server administration

## Pattern di Utilizzo

### Pattern 1: Feature Development
```
Scenario: Implementare una nuova funzionalità

Workflow:
1. master-orchestrator → Analizza requisiti
2. agent-organizer → Scompone il task
3. python-pro → Implementa la feature
4. code-reviewer → Review del codice
5. qa-expert → Testing
6. devops-engineer → Deploy (se necessario)
```

### Pattern 2: Bug Fix Rapido
```
Scenario: Fix di un bug critico

Workflow:
1. python-pro → Analizza e fixa il bug
2. qa-expert → Verifica il fix
3. code-reviewer → Quick review
```

### Pattern 3: Deployment Pipeline
```
Scenario: Setup completo CI/CD

Workflow:
1. workflow-orchestrator → Design pipeline
2. devops-engineer → Implementa infrastruttura
3. qa-expert → Setup test automation
4. python-pro → Configura build Python
```

### Pattern 4: Nuovo Progetto Setup
```
Scenario: Inizializzare progetto completo

Workflow:
1. multi-agent-coordinator → Orchestrazione setup
   Parallelo:
   - python-pro → Struttura app Python
   - devops-engineer → Config Docker
   - qa-expert → Framework test
2. workflow-orchestrator → Define development workflow
```

### Pattern 5: Code Review & Quality
```
Scenario: Review codice e quality check

Workflow:
1. code-reviewer → Analizza codice
2. qa-expert → Verifica test coverage
3. python-pro → Implementa fix (se necessario)
```

### Pattern 6: Performance Optimization
```
Scenario: Ottimizzare performance

Workflow:
1. python-pro → Profiling e ottimizzazione
2. qa-expert → Performance testing
3. devops-engineer → Container optimization
4. code-reviewer → Review modifiche
```

## Come Invocare gli Agenti

### Metodo 1: Invocazione Diretta (Task Semplici)
```
"Have the python-pro agent implement RSS feed generation"
"Ask code-reviewer to review the recent changes"
"Get qa-expert to create test suite"
```

### Metodo 2: Orchestrazione (Task Complessi)
```
"Use master-orchestrator to coordinate the development of a new feature"
"Have multi-agent-coordinator orchestrate parallel development tasks"
"Ask agent-organizer to break down and assign this complex requirement"
```

### Metodo 3: Automatico
Claude Code automaticamente seleziona e invoca gli agenti appropriati in base al task. Il master-orchestrator aiuta in questa decisione.

## Quick Reference

| Cosa devi fare | Agente da usare |
|----------------|-----------------|
| **Decisioni strategiche/architetturali** | `solution-architect` |
| **Web scraping notizie LoL** | `chrome-automation-expert` |
| Scrivere codice Python | `python-pro` |
| Setup Docker | `devops-engineer` |
| Review codice | `code-reviewer` |
| Scrivere test | `qa-expert` |
| **Validazione RSS 2.0** | `rss-validator` |
| **Security assessment** | `security-auditor` |
| **Fix vulnerabilità** | `security-engineer` |
| **Rilevamento secrets/API keys** | `secrets-scanner` |
| **Compliance SDLC** | `compliance-auditor` |
| **GitFlow enforcement** | `git-workflow-manager` |
| **Code cleanup/refactoring** | `refactoring-specialist` |
| **Dependency security** | `dependency-manager` |
| **Audit documentazione** | `documentation-auditor` |
| **CI/CD pipeline audit** | `ci-cd-auditor` |
| **Windows deployment** | `windows-deployment-validator` |
| Task multi-dominio complesso | `master-orchestrator` |
| Coordinare 3+ agenti | `multi-agent-coordinator` |
| Scomporre task complesso | `agent-organizer` |
| Design workflow/pipeline | `workflow-orchestrator` |
| Distribuire molti task | `task-distributor` |

## Strumenti Disponibili per Agente

### Agenti con Accesso Completo
- **solution-architect**: Read, Write, Edit, Glob, Grep, Bash (design & documentation)
- **python-pro**: Read, Write, Edit, Bash, Glob, Grep (implementation)
- **devops-engineer**: Read, Write, Edit, Bash, Glob, Grep (infrastructure)
- **chrome-automation-expert**: Read, Write, Edit, Bash, Glob, Grep, **mcp__chrome-devtools__*** (tutti i tools Chrome)
- **multi-agent-coordinator**: Read, Write, Edit, Glob, Grep, Bash (coordination)
- **agent-organizer**: Read, Write, Edit, Glob, Grep, Bash (organization)
- **workflow-orchestrator**: Read, Write, Edit, Glob, Grep, Bash (workflow design)
- **task-distributor**: Read, Write, Edit, Glob, Grep, Bash (task allocation)
- **master-orchestrator**: Read, Write, Edit, Glob, Grep, Bash, **Task** (delegation)

### Agenti Read-Only
- **code-reviewer**: Read, Grep, Glob (review only, no changes)

### Agenti con Testing
- **qa-expert**: Read, Grep, Glob, Bash (testing & validation)

## Best Practices

### 0. ⚠️ REGOLA FONDAMENTALE: Mai Fare Lavoro Diretto
**Claude Code (principale) DEVE SEMPRE delegare:**
- ❌ Mai scrivere codice direttamente
- ❌ Mai creare/modificare file
- ❌ Mai eseguire comandi implementativi
- ✅ SEMPRE analizzare e delegare agli agenti
- ✅ SEMPRE coordinare tramite Task tool
- ✅ SEMPRE sintetizzare risultati

### 1. Ordine di Invocazione per Nuove Feature
1. **Prima**: `solution-architect` → Design architettura
2. **Poi**: Agenti implementativi (python-pro, devops-engineer, etc.)
3. **Infine**: Quality gates (code-reviewer, qa-expert)

### 2. Scegli l'Agente Giusto
- Decisioni architetturali → solution-architect PRIMA di tutto
- Web scraping → chrome-automation-expert
- Per task semplici a dominio singolo → usa specialista direttamente
- Per task complessi multi-dominio → usa orchestratori
- Quando in dubbio → usa master-orchestrator

### 3. Coordinazione Efficiente
- Task indipendenti → esecuzione parallela
- Task dipendenti → esecuzione sequenziale
- Pipeline dati → workflow-orchestrator
- Review cycles → code-reviewer + qa-expert

### 4. Quality Gates
Sempre includere:
- Architecture review (solution-architect) per feature significative
- Code review (code-reviewer)
- Testing (qa-expert)
- Docker validation (devops-engineer)
- Best practices (python-pro)

### 5. Priorità Progetto
1. **Architecture First** - solution-architect decide PRIMA
2. RSS 2.0 Compliance
3. Windows Compatibility
4. Python Best Practices
5. Security
6. Performance
7. Reliability

## Esempi Pratici

### Esempio 1: Implementare Caching
```
Request: "Add caching to RSS feed"

Master Orchestrator Decision:
1. solution-architect → Design caching strategy (Redis vs in-memory vs file)
2. python-pro → Implement caching logic based on architecture
3. code-reviewer → Review implementation
4. qa-expert → Test cache behavior
5. devops-engineer → Configure cache in Docker
```

### Esempio 2: Scraping Notizie LoL
```
Request: "Scrape League of Legends news"

Master Orchestrator Decision:
1. solution-architect → Design scraping strategy (optional se semplice)
2. chrome-automation-expert → Extract news from LoL websites
3. python-pro → Transform scraped data to structured format
4. qa-expert → Validate extraction accuracy
5. devops-engineer → Schedule scraping jobs
```

### Esempio 3: Setup Completo CI/CD
```
Request: "Setup complete CI/CD pipeline"

Master Orchestrator Decision:
1. solution-architect → Design pipeline architecture
2. workflow-orchestrator → Design pipeline workflow
3. devops-engineer → Implement GitHub Actions
4. qa-expert → Configure test automation
5. python-pro → Ensure Python builds correctly
```

### Esempio 4: Review Codice
```
Request: "Review this code"

Direct Invocation:
1. code-reviewer → Perform review
```

### Esempio 5: Nuovo Progetto Completo
```
Request: "Build the entire project from scratch"

Complex Orchestration with Architecture First:
1. solution-architect → Design complete system architecture
2. agent-organizer → Break down into implementation phases
3. multi-agent-coordinator → Orchestrate execution
   Parallel:
   - chrome-automation-expert → Web scraping component
   - python-pro → RSS feed generation + HTTP server
   - devops-engineer → Docker configuration
   - qa-expert → Test framework
4. workflow-orchestrator → Setup development processes
5. code-reviewer → Review all implementations
```

## Metriche di Successo

Monitora:
- ✅ Task completion accuracy
- ✅ Agent utilization efficiency
- ✅ Time to delivery
- ✅ Quality of outputs
- ✅ Code coverage > 90%
- ✅ Docker build success
- ✅ RSS 2.0 compliance
- ✅ Windows deployment success

## Troubleshooting

### Agent non risponde come atteso
- Verifica che la descrizione dell'agente corrisponda al task
- Considera di usare master-orchestrator per decisione migliore
- Usa agent-organizer per scomporre task complessi

### Task troppo complesso per singolo agente
- Usa multi-agent-coordinator per orchestrazione
- Usa agent-organizer per decomposizione task
- Definisci workflow con workflow-orchestrator

### Conflitti tra agenti
- Usa master-orchestrator per coordinazione
- Definisci priorità chiare
- Usa workflow sequenziali invece di paralleli

## Prossimi Passi

1. ✅ Sistema agenti configurato
2. 📝 Inizia a usare gli agenti per sviluppo
3. 🔄 Itera e ottimizza workflow
4. 📊 Monitora metriche e performance
5. 🚀 Scala il sistema per progetti più grandi

## Supporto

Per domande o problemi con il sistema di agenti:
- Consulta questa documentazione
- Usa master-orchestrator per decisioni complesse
- Riferisciti a VoltAgent awesome-claude-code-subagents repository

---

**Versione**: 2.0
**Progetto**: LoL Stonks RSS
**Data**: 2025-12-30
**Framework**: VoltAgent Claude Code Subagents
**Agenti Totali**: 22 (+ README)
