# Guía de Migración a Blockchain - FoodLabs Pay v2.0

## ⚠️ Nota Importante

Este documento describe la **arquitectura futura** del sistema de wallets tokenizado. **NO implementar todavía**. Esta guía sirve como referencia para cuando se decida migrar a blockchain (en semanas o meses).

---

## 🎯 Objetivo de la Migración

Convertir el sistema de wallets internas (v1.0) en un sistema descentralizado donde:
- Los saldos son **tokens ERC-20** en blockchain
- Las transacciones son **on-chain** y transparentes
- Los usuarios tienen control real de sus fondos
- Sistema 100% auditable e inmutable

---

## 🌐 Por Qué Blockchain

### Ventajas

✅ **Transparencia Total**
- Todas las transacciones son públicas
- Auditoría en tiempo real
- Imposible manipular registros

✅ **Control del Usuario**
- Usuarios controlan sus propios fondos
- No dependencia total de FoodLabs
- Wallet no-custodial (opcional)

✅ **Reducción de Costos**
- No necesitas banco para liquidaciones
- Pagos instantáneos 24/7
- Sin comisiones bancarias

✅ **Escalabilidad Internacional**
- Mismo sistema para cualquier país
- No necesitas cuentas bancarias en cada país
- Conversión automática de monedas

✅ **Marketing y Diferenciación**
- Primera plataforma de delivery con crypto
- "Usa crypto sin darte cuenta"
- Atrae usuarios tech-savvy

### Desventajas

❌ **Complejidad Técnica**
- Requiere conocimiento de Solidity
- Auditorías de smart contracts
- Manejo de gas fees

❌ **Costos Iniciales**
- Desarrollo de contratos
- Auditoría de seguridad (~$10-50K USD)
- Infraestructura blockchain

❌ **Regulación**
- Área gris legal en Honduras
- Posible necesidad de licencias
- Compliance con regulaciones crypto

❌ **Experiencia de Usuario**
- Usuarios no familiarizados con crypto
- Necesitan entender conceptos nuevos
- Posible fricción en onboarding

---

## 🏗️ Arquitectura Propuesta

### Stack Tecnológico

**Blockchain:**
- **Red**: Base (Layer 2 de Ethereum)
  - Costos ultra-bajos (~$0.01 por transacción)
  - Rápido (1-2 segundos)
  - Compatible con Ethereum
  - Respaldado por Coinbase

**Alternativas:**
- Polygon (más establecido)
- Optimism (similar a Base)
- Arbitrum (más descentralizado)

**Smart Contracts:**
- Lenguaje: Solidity
- Framework: Hardhat o Foundry
- Testing: Chai + Hardhat

**Wallet Provider:**
- **Privy** (recomendado)
  - Wallets embebidas
  - Email/Social login
  - No requiere MetaMask
  - UX como app tradicional

**Alternativas:**
- Thirdweb
- Magic Link
- WalletConnect

**Backend:**
- Mantener Firebase para cache y UI
- Agregar indexer (The Graph) para datos blockchain
- Webhooks para eventos on-chain

---

## 🪙 Arquitectura de Tokens

### Tokens Propuestos

#### 1. LMP (Lempira Token)
```solidity
// Token ERC-20 para Lempiras Hondureños
// 1 LMP = 1 HNL
// Total Supply: Ilimitado (minteable)
```

#### 2. QZT (Quetzal Token)
```solidity
// Token ERC-20 para Quetzales Guatemaltecos
// 1 QZT = 1 GTQ
// Total Supply: Ilimitado (minteable)
```

#### 3. Opción: USDC Nativo
```solidity
// Usar USDC directamente
// 1 USDC = 1 USD
// Conversión automática en UI
```

### Características de los Tokens

**LMP Token:**
- ✅ Minteable (solo FoodLabs puede crear)
- ✅ Burnable (solo FoodLabs puede destruir)
- ✅ Pausable (en caso de emergencia)
- ✅ Upgradeable (con proxy pattern)
- ❌ NO transferible entre usuarios (solo FoodLabs puede mover)

**Razón de NO transferible:**
- Evita lavado de dinero
- Mantiene compliance
- Previene mercado secundario
- Facilita regulación

---

## 📋 Smart Contracts Necesarios

### 1. Token Contract (`FoodLabsToken.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract FoodLabsToken is 
    Initializable, 
    ERC20Upgradeable, 
    AccessControlUpgradeable, 
    PausableUpgradeable 
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory name, string memory symbol) initializer public {
        __ERC20_init(name, symbol);
        __AccessControl_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Override transfer para hacerlo restringido
    function transfer(address, uint256) public pure override returns (bool) {
        revert("Transfers not allowed. Use FoodLabs app.");
    }

    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("Transfers not allowed. Use FoodLabs app.");
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
```

### 2. Escrow Contract (`FoodLabsEscrow.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./FoodLabsToken.sol";

contract FoodLabsEscrow is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    FoodLabsToken public token;
    
    struct Order {
        address customer;
        address restaurant;
        uint256 amount;
        uint256 commission;
        uint256 timestamp;
        OrderStatus status;
    }
    
    enum OrderStatus { Pending, Confirmed, Cancelled, Completed }
    
    mapping(bytes32 => Order) public orders;
    
    event OrderCreated(bytes32 indexed orderId, address customer, address restaurant, uint256 amount);
    event OrderConfirmed(bytes32 indexed orderId, uint256 restaurantAmount, uint256 commission);
    event OrderCancelled(bytes32 indexed orderId);
    
    function initialize(address _token) initializer public {
        __Ownable_init();
        __ReentrancyGuard_init();
        token = FoodLabsToken(_token);
    }
    
    function createOrder(
        bytes32 orderId,
        address customer,
        address restaurant,
        uint256 amount,
        uint256 commission
    ) external onlyOwner nonReentrant {
        require(orders[orderId].timestamp == 0, "Order already exists");
        require(token.balanceOf(customer) >= amount, "Insufficient balance");
        
        // Transfer tokens to escrow
        token.transferFrom(customer, address(this), amount);
        
        orders[orderId] = Order({
            customer: customer,
            restaurant: restaurant,
            amount: amount,
            commission: commission,
            timestamp: block.timestamp,
            status: OrderStatus.Pending
        });
        
        emit OrderCreated(orderId, customer, restaurant, amount);
    }
    
    function confirmOrder(bytes32 orderId, address adminWallet) external onlyOwner nonReentrant {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Pending, "Invalid status");
        
        uint256 restaurantAmount = order.amount - order.commission;
        
        // Transfer to restaurant
        token.transfer(order.restaurant, restaurantAmount);
        
        // Transfer commission to admin
        token.transfer(adminWallet, order.commission);
        
        order.status = OrderStatus.Confirmed;
        
        emit OrderConfirmed(orderId, restaurantAmount, order.commission);
    }
    
    function cancelOrder(bytes32 orderId) external onlyOwner nonReentrant {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Pending, "Invalid status");
        
        // Refund to customer
        token.transfer(order.customer, order.amount);
        
        order.status = OrderStatus.Cancelled;
        
        emit OrderCancelled(orderId);
    }
}
```

### 3. Topup Contract (`FoodLabsTopup.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./FoodLabsToken.sol";

contract FoodLabsTopup is AccessControlUpgradeable {
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");
    
    FoodLabsToken public token;
    
    struct TopupRequest {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool approved;
        bool rejected;
        address approvedBy;
    }
    
    mapping(bytes32 => TopupRequest) public topupRequests;
    
    event TopupRequested(bytes32 indexed requestId, address user, uint256 amount);
    event TopupApproved(bytes32 indexed requestId, address approver);
    event TopupRejected(bytes32 indexed requestId, address approver);
    
    function initialize(address _token) initializer public {
        __AccessControl_init();
        token = FoodLabsToken(_token);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(APPROVER_ROLE, msg.sender);
    }
    
    function requestTopup(uint256 amount) external {
        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, block.timestamp, amount));
        
        topupRequests[requestId] = TopupRequest({
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            approved: false,
            rejected: false,
            approvedBy: address(0)
        });
        
        emit TopupRequested(requestId, msg.sender, amount);
    }
    
    function approveTopup(bytes32 requestId) external onlyRole(APPROVER_ROLE) {
        TopupRequest storage request = topupRequests[requestId];
        require(!request.approved && !request.rejected, "Already processed");
        
        // Mint tokens to user
        token.mint(request.user, request.amount);
        
        request.approved = true;
        request.approvedBy = msg.sender;
        
        emit TopupApproved(requestId, msg.sender);
    }
    
    function rejectTopup(bytes32 requestId) external onlyRole(APPROVER_ROLE) {
        TopupRequest storage request = topupRequests[requestId];
        require(!request.approved && !request.rejected, "Already processed");
        
        request.rejected = true;
        request.approvedBy = msg.sender;
        
        emit TopupRejected(requestId, msg.sender);
    }
}
```

---

## 🔄 Plan de Migración

### Fase 1: Preparación (2-4 semanas)

**Semana 1-2: Desarrollo de Contratos**
- [ ] Escribir smart contracts
- [ ] Unit tests (cobertura > 90%)
- [ ] Deploy a testnet (Base Goerli)
- [ ] Testing extensivo

**Semana 3-4: Auditoría**
- [ ] Contratar auditor (ej: OpenZeppelin, ConsenSys Diligence)
- [ ] Implementar cambios sugeridos
- [ ] Re-test
- [ ] Deploy a mainnet (Base)

**Costos estimados:**
- Desarrollo: $5-10K USD (si lo hace el equipo)
- Auditoría: $10-50K USD (dependiendo del auditor)
- Gas fees de deploy: ~$100-500 USD

### Fase 2: Integración Backend (2 semanas)

**Integración con Blockchain:**
- [ ] Configurar provider (Alchemy/Infura)
- [ ] Implementar wallet management con Privy
- [ ] Crear servicios para interactuar con contratos
- [ ] Mantener Firebase como cache/UI

**Estructura:**
```javascript
// src/services/blockchain/
├── tokenContract.js       // Interacción con token
├── escrowContract.js      // Interacción con escrow
├── topupContract.js       // Interacción con topups
├── walletProvider.js      // Privy integration
└── indexer.js             // The Graph queries
```

### Fase 3: Migración de Frontend (2 semanas)

**Actualizar UI:**
- [ ] Integrar Privy SDK
- [ ] Actualizar WalletCard (mostrar dirección blockchain)
- [ ] Agregar "View on Explorer" links
- [ ] Mantener mismo flujo UX

**Nuevos componentes:**
```javascript
// src/components/blockchain/
├── WalletConnect.jsx      // Conectar wallet
├── TransactionStatus.jsx  // Estado de tx on-chain
├── BlockchainBadge.jsx    // Muestra "Powered by Base"
└── GasEstimator.jsx       // Estima costos (opcional)
```

### Fase 4: Migración de Datos (1 semana)

**Estrategia de migración:**

**Opción A: Hard Migration (recomendado)**
1. Anunciar a usuarios con 1 semana de anticipación
2. Día de migración:
   - Pausar sistema v1.0
   - Para cada usuario con balance > 0:
     - Crear wallet blockchain
     - Mintear tokens equivalentes
     - Registrar en Firebase
   - Activar sistema v2.0
3. Balances migrados en ~4-6 horas

**Opción B: Soft Migration (gradual)**
1. Mantener ambos sistemas en paralelo
2. Usuarios nuevos usan v2.0
3. Usuarios existentes migran opcionalmente
4. Deprecar v1.0 en 3-6 meses

**Recomendación:** Opción A si < 1000 usuarios, Opción B si > 1000

### Fase 5: Testing en Producción (1-2 semanas)

**Beta Testing:**
- [ ] Invitar 10-20 usuarios beta
- [ ] Monitorear transacciones
- [ ] Recopilar feedback
- [ ] Ajustar según necesidad

**Métricas a monitorear:**
- Tiempo de confirmación de transacciones
- Costos de gas por transacción
- Tasa de error
- Satisfacción de usuarios

### Fase 6: Lanzamiento Oficial

**Pre-lanzamiento:**
- [ ] Comunicado de prensa
- [ ] Campaña de marketing ("Crypto sin darte cuenta")
- [ ] Tutoriales para usuarios
- [ ] Soporte 24/7 activo

**Día del lanzamiento:**
- [ ] Activar sistema v2.0
- [ ] Monitoreo intensivo
- [ ] Respuesta rápida a issues

---

## 💰 Modelo Económico

### Cómo Funciona el Dinero

**Usuario Recarga L 100:**
1. Usuario transfiere L 100 a cuenta bancaria de FoodLabs
2. Admin aprueba → Mintea 100 LMP tokens
3. Usuario tiene 100 LMP en su wallet blockchain

**Usuario Hace Pedido de L 50:**
1. Sistema mueve 50 LMP de user → escrow contract
2. Restaurante confirma
3. Escrow transfiere:
   - 44 LMP al restaurante (50 - 12%)
   - 6 LMP a FoodLabs admin wallet

**Restaurante Liquida L 1,000:**
1. Tiene 1,000 LMP en wallet
2. Solicita liquidación
3. FoodLabs:
   - Quema 150 LMP (15% comisión)
   - Transfiere L 850 al banco del restaurante
   - Registra en contabilidad

### Respaldo del Token

**¿Cómo se garantiza 1 LMP = 1 HNL?**

**Opción 1: Respaldo Bancario (más simple)**
- FoodLabs mantiene cuenta bancaria con fondos
- Por cada LMP mintrado, hay 1 HNL en el banco
- Auditoría mensual de saldos
- Sistema de reserva fraccional (como bancos)

**Opción 2: Stablecoin Backing (más complejo)**
- Comprar USDC equivalente cuando minteas LMP
- Vender USDC cuando quemas LMP
- Mantiene paridad automática
- Costos de conversión

**Recomendación:** Opción 1 para empezar, Opción 2 cuando escales internacionalmente

---

## 🔒 Seguridad

### Riesgos y Mitigaciones

#### Riesgo 1: Vulnerabilidad en Smart Contracts
**Probabilidad:** Media
**Impacto:** Crítico
**Mitigación:**
- ✅ Auditoría profesional obligatoria
- ✅ Bug bounty program
- ✅ Contracts pausables
- ✅ Timelock para upgrades

#### Riesgo 2: Pérdida de Llaves Privadas
**Probabilidad:** Baja (con Privy)
**Impacto:** Alto
**Mitigación:**
- ✅ Usar Privy (wallets custodiales)
- ✅ Recuperación por email
- ✅ Backup de llaves en hardware wallet
- ✅ Multi-sig para admin wallet

#### Riesgo 3: Ataque de 51%
**Probabilidad:** Muy baja (usando Base)
**Impacto:** Crítico
**Mitigación:**
- ✅ Usar L2 establecido (Base)
- ✅ No implementar consensus propio
- ✅ Monitoreo de red

#### Riesgo 4: Regulatorio
**Probabilidad:** Media
**Impacto:** Alto
**Mitigación:**
- ✅ Consultar con abogado crypto
- ✅ Obtener licencias necesarias
- ✅ KYC/AML compliance
- ✅ Límites de transacción

### Best Practices

**Smart Contracts:**
- ✅ Usar OpenZeppelin libraries
- ✅ Principle of least privilege
- ✅ Fail-safe defaults
- ✅ Check-effects-interactions pattern
- ✅ Reentrancy guards

**Wallets:**
- ✅ Admin wallet en hardware (Ledger/Trezor)
- ✅ Multi-sig para operaciones grandes
- ✅ Timelock para cambios críticos
- ✅ Separate hot/cold wallets

**Monitoring:**
- ✅ Alertas de transacciones grandes
- ✅ Monitoring de balances
- ✅ Logs de todas las operaciones
- ✅ Dashboard de seguridad

---

## 📊 Costos Estimados

### Desarrollo Inicial

| Item | Costo Estimado |
|------|----------------|
| Desarrollo de contratos | $5,000 - $10,000 |
| Auditoría de seguridad | $10,000 - $50,000 |
| Testing en testnet | $500 - $1,000 |
| Deploy a mainnet | $100 - $500 |
| Integración Privy | $0 (hasta 10k usuarios) |
| Infraestructura (Alchemy) | $0 - $200/mes |
| **Total inicial** | **$15,600 - $61,700** |

### Costos Operacionales Mensuales

| Item | Costo Mensual |
|------|---------------|
| Gas fees (Base) | ~$100 - $500 |
| Privy (si > 10k usuarios) | $0.05 por usuario |
| Alchemy/Infura | $0 - $200 |
| Mantenimiento | $500 - $1,000 |
| **Total mensual** | **$600 - $1,700** |

### ROI Esperado

**Ahorro en costos bancarios:**
- Transferencias bancarias: ~$2-5 por transacción
- Con blockchain: ~$0.01 por transacción
- Si 1,000 liquidaciones/mes: Ahorro de $2,000-$5,000/mes

**Tiempo de implementación:** 6-10 semanas
**Break-even point:** 8-31 meses (dependiendo de volumen)

---

## 🚀 Roadmap Sugerido

### Q1 2024 (Si empiezan ahora)
- ✅ Sistema v1.0 funcionando (YA HECHO)
- 📝 Planificación de v2.0
- 👨‍💻 Contratar desarrollador Solidity

### Q2 2024
- 🏗️ Desarrollo de smart contracts
- 🔍 Auditoría de contratos
- 🧪 Testing extensivo

### Q3 2024
- 🌐 Deploy a mainnet
- 🔄 Migración de usuarios
- 🎉 Lanzamiento beta

### Q4 2024
- 📱 Lanzamiento público
- 📊 Optimizaciones
- 🌍 Expansión a otros países

---

## 🤝 Partners Tecnológicos Recomendados

### Auditorías
1. **OpenZeppelin** (premium, más confiable)
2. **ConsenSys Diligence** (mid-range)
3. **Certik** (más asequible)

### Infraestructura
1. **Alchemy** (mejor UX)
2. **Infura** (más establecido)
3. **QuickNode** (más rápido)

### Wallets
1. **Privy** (mejor para no-crypto users)
2. **Thirdweb** (más features)
3. **Magic Link** (más simple)

### Indexing
1. **The Graph** (estándar de la industria)
2. **Covalent** (más fácil de usar)
3. **Moralis** (all-in-one)

---

## 📚 Recursos para Aprender

### Cursos
- [CryptoZombies](https://cryptozombies.io) - Solidity basics
- [Alchemy University](https://university.alchemy.com) - Blockchain development
- [Buildspace](https://buildspace.so) - Web3 projects

### Documentación
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Base Docs](https://docs.base.org)
- [Privy Docs](https://docs.privy.io)

### Comunidades
- [Base Discord](https://discord.gg/base)
- [Ethereum StackExchange](https://ethereum.stackexchange.com)
- [r/ethdev](https://reddit.com/r/ethdev)

---

## ✅ Checklist Pre-Migración

Antes de empezar la migración, asegúrate de:

- [ ] Sistema v1.0 estable y funcionando
- [ ] Al menos 3-6 meses de operación con v1.0
- [ ] > 100 usuarios activos
- [ ] Equipo técnico con experiencia en Solidity
- [ ] Presupuesto de $15-60K USD disponible
- [ ] Asesoría legal sobre regulación crypto
- [ ] Plan de comunicación a usuarios
- [ ] Soporte técnico preparado
- [ ] Backup plan si algo falla

---

## 🚨 Señales de que NO es el Momento

❌ **NO migrar si:**
- Menos de 50 usuarios activos
- Sistema v1.0 con bugs frecuentes
- No tienes desarrollador con experiencia Solidity
- Presupuesto limitado (< $10K USD)
- No has consultado con abogado
- Usuarios no están familiarizados con tech
- No tienes plan de soporte 24/7

---

## 🎯 Conclusión

La migración a blockchain es **emocionante y estratégica**, pero requiere:
- ✅ Preparación adecuada
- ✅ Recursos suficientes
- ✅ Equipo capacitado
- ✅ Paciencia y testing

**Recomendación:** Espera hasta tener **sistema v1.0 estable** con **al menos 100 usuarios activos** antes de considerar la migración.

Mientras tanto:
1. Mantén v1.0 funcionando perfectamente
2. Educa al equipo en blockchain
3. Monitorea el ecosistema crypto
4. Planifica la arquitectura
5. Ahorra para la auditoría

---

¿Preguntas? Contacta al equipo técnico de FoodLabs 🚀
