# 🏦 Gama Token 📚 Web 3.0 - Grupo 5

Este repositório consiste no trabalho conjunto do grupo 5 para produzir um MVP de uma aplicação de _Vending Machine_, que realiza a compra e venda de tokens ERC20 desenvolvidos pelo grupo. Para isto, foram desenvolvidos um conjunto de  `Smart Contracts` em linguagem `Solidity`.

Apresentação: https://drive.google.com/file/d/1NTHybA9xVtynM2RhBl9uFARK_8HIgXMI/view?usp=sharing

## 👨‍💻 Integrantes
* [Caio Moraes](https://github.com/caioDesenvMoraes)
* [Richard Silva](https://github.com/RichSilva)
* [Saulo Freitas](https://github.com/SauloFreitas01)

## 🛠 Tecnologias utilizadas.
* [Solidity](https://docs.soliditylang.org/en/v0.8.14/)
* [Hardhat](https://hardhat.org/)
* [Waffle](https://ethereum-waffle.readthedocs.io/en/latest/index.html)
* [Ethers](https://docs.ethers.io/v5/)
* [Chai](https://www.chaijs.com/)

## 📝 Estrutura do projeto

O projeto consiste na construção e teste de dois `Smart Contracts` distintos, criando um token conforme o padrão ERC20 e tendo sua compra e venda disponibilizada através de um contrato de uma máquina de venda, que permite a compra e venda do token além do reabastecimento de ambos tokens e ethers. Foi utilizado a ferramenta Chai para a realização de testes do código. O código está organizado da seguinte forma:

Dentro da pasta smart_contracts estão localizados o arquivo CryptoToken.sol, onde está implementado o Token, e VendingMachine.sol, onde está implementado o contrato de máquina de vendas. Os testes estão implementados dentro da pasta test.

## 💲 Contrato de Token
O Token deste projeto foi desenvolvido sob o nome CryptoToken dentro do diretório `/smart_contract/contracts/` e tendo como base os conhecimentos obtidos nas aulas assistidas e conforme o padrão ERC20, porém, dado ao escopo do projeto, nem todos as funcionalidades do padrão foram utilizadas. 

As principais funcionalidades consistem em:

* Criação de token e seu respectivo dono;
* Transferência de tokens de uma carteira para outro;
* Manipulação do estado do contrato, permitindo ser pausado e retomado pelo dono;
* Criação (mint) e destruição (burn) de tokens;
* Destruição do contrato.

## 💱 Contrato de Máquina de vendas
Este contrato se encontra  em `/smart_contract/contracts/` sob o nome VendingMachine.sol, utilizando os conceitos praticados nas aulas do criptodev para viabilizar a compra e venda do token desenvolvido pelo grupo.

Suas principais características consistem em:

* Compra e venda de tokens;
* Renovação de estoque de tokens e ethers permitidos somente ao dono;
* Saque de Ethers permitido somente ao dono;
* Edição do preço de compra e venda  do token permitidas somente ao dono;
* Consulta de saldo de tokens e ethers da máquina.

## ✅ Testes

Localizado em `/smart_contract/test/`, estes testes foram desenvolvidos para garantir que o produto desenvolvido cumpra os critérios estabelecidos e apresente o comportamento desejado e se obtenha maior confiança e controle na aplicação. 

Alguns dos itens abordados dentro do escopo de teste são:

* Criação de estoque de tokens.
* Atribuição dos tokens ao dono
* Verificação da transferência entre carteiras em cenários distintos.
* Alteração do estado do contrato.
* Criação de tokens.
* Destruição de tokens.
* Destruição do contrato.
* Permissões exclusivas do dono.
* Condições exclusivas de estados.

## ▶️ Utilizando a aplicação
Optou-se a utilização da IDE Remix para a interação com a aplicação desenvolvida, devido a sua integração de interface visual e ambiente de desenvolvimento de fácil utilização, para fazer uso desse recurso, acesse  https://remix.ethereum.org e copie a pasta smart_contracts deste repositório para o espaço de trabalho da IDE, Compile ambos contratos, realizando primeiro o deploy do contrato de token, informando a quantidade de tokens a serem criados inicialmente. É preciso obter o endereço deste contrato para inicializar o contrato de máquina de vendas. Feito ambos deploys, é possível interagir com o contrato através da interface gráfica do Remix para estudar seu comportamento.

## 🚀 Instruções para Execução de Testes Unitários no VS Code
Primeiro passo - clonar o repositorio
```shell
git clone https://github.com/SauloFreitas01/gamacoin-cryptodev
```

Segundo passo - entrar na pasta ```gamacoin-cryptodev```, depois na pasta ```smart_contract``` e instalar as dependências
```shell
cd gamacoin-cryptodev
cd smart_contract
npm install 
```

Terceiro passo - abrir o interpretador de texto (de preferência o VSCode)
```shell
code .
```

Quarto passo - no terminal do VSCode compila os arquivos
```shell
npx hardhat compile
```

Quinto passo - no terminal do VSCode rodar os testes
```shell
npx hardhat test
```

