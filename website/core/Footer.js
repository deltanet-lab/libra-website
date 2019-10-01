/**
 * Copyright (c) The Libra Core Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const PropTypes = require('prop-types');
const React = require('react');
const CookieBanner = require(`${process.cwd()}/core/CookieBanner`);

function SocialFooter(props) {
  const projectName = 'libra';
  const repoUrl = `https://github.com/${props.config.organizationName}/${
    projectName
  }`;
  const baseUrl = props.config.baseUrl;

  return (
    <div className="footerSection">
      <h5>Social</h5>
      <div className="social">
        <a
          className="github-button" // part of the https://buttons.github.io/buttons.js script in siteConfig.js
          href={repoUrl}
          data-count-href={`${repoUrl}/stargazers`}
          data-show-count="true"
          data-count-aria-label="# stargazers on GitHub"
          aria-label="Star Libra on GitHub">
          {projectName}
        </a>
      </div>
      <div className="social">
        <a
          href={"https://twitter.com/libradev?ref_src=twsrc%5Etfw"}
          className={"twitter-follow-button"}
          data-show-count={false}>
            Follow @libradev
        </a>
        <script
          async
          src={`${baseUrl}js/twitter-widgets.js`}
          charSet={"utf-8"}
        />
      </div>
    </div>
  );
}

SocialFooter.propTypes = {
  config: PropTypes.object,
};

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : '') + doc;
  }

  render() {
    const currentYear = new Date().getFullYear();
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          {this.props.config.footerIcon && (
            <a href={this.props.config.baseUrl} className="nav-home">
              <img
                src={`${this.props.config.baseUrl}${
                  this.props.config.footerIcon
                }`}
                alt={this.props.config.title}
              />
            </a>
          )}
          <div className="footerSection">
            <h5>学习Libra</h5>
            <a href={this.docUrl('welcome-to-libra')}>欢迎来到Libra开发者网站</a>
            <a href={this.docUrl('libra-protocol')}>Libra协议</a>
            <a href={this.docUrl('the-libra-blockchain-paper')}>Libra区块链</a>
            <a href={this.docUrl('life-of-a-transaction')}>交易的生命周期</a>
            <p />
            <h5>体验Libra Core</h5>
            <a href={this.docUrl('my-first-transaction')}>我的第一笔交易</a>
            <a href={this.docUrl('move-overview')}>Move入门</a>
          </div>
          <div className="footerSection">
            <h5>政策条款</h5>
            <a href={this.docUrl('policies/privacy-policy')}>隐私条款</a>
            <a href={this.docUrl('policies/terms-of-use')}>使用条款</a>
            <a href={this.docUrl('policies/cookies-policy')}>Cookies条款</a>
            <a href={this.docUrl('policies/code-of-conduct')}>行为准则</a>
            <p />
            <h5>社区</h5>
            <a href="https://community.libra.org/">开发者论坛</a>
            <a href="https://developers.libra.org/newsletter_form">Newsletter</a>
          </div>
          <SocialFooter config={this.props.config} />
        </section>
        <section className="copyright">
          {this.props.config.copyright && (
            <span>{this.props.config.copyright}</span>
          )}{' '}
          &copy; Libra Association
        </section>
        <CookieBanner />
      </footer>
    );
  }
}

module.exports = Footer;
