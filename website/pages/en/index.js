/**
 * Copyright (c) The Libra Core Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock;
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const bash = (...args) => `~~~bash\n${String.raw(...args)}\n~~~`;

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="splashLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <div className="inner">
          <Logo img_src={baseUrl + 'img/libra-header-logo-white.png'} />
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={docUrl('welcome-to-libra')}>欢迎来到开发者网站</Button>
            <Button href={docUrl('the-libra-blockchain-paper.html')}>Libra区块链技术论文</Button>
            <Button href={docUrl('move-overview.html')}>Move入门</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl} = siteConfig;

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const Description = () => (
      <Block background="light">
        {[
          {
            content:
              'This is another description of how this project is useful',
            image: `${baseUrl}img/libra_logo_lockup_white.svg`,
            imageAlign: 'right',
            title: 'Description',
          },
        ]}
      </Block>
    );
    // getStartedSection
    const pre = '```';
    // Example for connecting to test network
    const exampleConnectToNetwork = `${pre}rust
    `;
    // Example for creating a wallet
    const exampleCreateWallet = `${pre}rust
    `;
    // Example for sending currency
    const exampleSendingCurrency = `${pre}rust
    `;
    //
    const QuickStart = () => (
      <div
        className="productShowcaseSection"
        id="quickstart"
        style={{textAlign: 'center', marginBottom:'30px'}}>
        <h2>快来体验Libra</h2>
        <p>当前只支持macOS和Linux系统。</p>
        <Container>
          <h4>1. 克隆Libra代码：</h4>
          <div style={{marginLeft:"30px"}}>
            <MarkdownBlock>{
bash`git clone https://github.com/libra/libra.git && cd libra`}</MarkdownBlock>
          </div>
          <h4>2. 检出Testnet分支：</h4>
          <div style={{marginLeft:"30px"}}>
            <MarkdownBlock>{bash`git checkout testnet`}</MarkdownBlock>
          </div>
          <h4>3. 安装依赖项：</h4>
          <div style={{marginLeft:"30px"}}>
            <MarkdownBlock>{bash`./scripts/dev_setup.sh`}</MarkdownBlock>
          </div>
            <h4>4. 执行命令行：</h4>
          <div style={{marginLeft:"30px"}}>
            <MarkdownBlock>{bash`./scripts/cli/start_cli_testnet.sh`}</MarkdownBlock>
          </div>
            <h4>5. 执行您的第一笔交易：</h4>
          <div style={{marginLeft:"30px"}}>
                <Button href={'docs/my-first-transaction'}>我的第一笔交易</Button>
          </div>
        </Container>
      </div>
    );

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="landingPage mainContainer">
          <QuickStart />
        </div>
      </div>
    );
  }
}

module.exports = Index;
