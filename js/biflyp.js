/*
    Copyright 2023 Dmitrij Kulabuhov

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

export default {
    props: {
        useHrefInLocation:{
            type: Boolean,
            required: false,
            default: false
        },
        href: {
            type: String,
            required: false,
            default: null
        },
        markdownText: {
            type: String,
            required: false,
            default: null
        },
        onlyOwnHostInHref:{
            type: Boolean,
            required: false,
            default: true
        },
        showTableOfContents: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    data() {
        return {
            html:"",
            headingList: {
                headArray:[],
                lastIndex: 0
            },
            md: null
        }
    },
    methods:{
        fetchMarkdownByHref(href){
            const requestOptions = {
                method: "GET"
            };
            fetch(
                href,
                requestOptions
            )
                .then(response => response.text())
                .then(text => {
                    this.updateMarkdown(text);
                });
        },
        updateMarkdown(mdText){
            this.html = this.md.render(mdText);
        },
        parseHeadLevelByTag(tag) {
            /*
            * Получаем тэг например h6 и уровнем будет число после символа h, например 6*/
            return parseInt(tag.charAt(1));
        },
        configureHeadingLevelArrayAndGetHeadArrayByLevel(headingLevelArray, level) {
            headingLevelArray.length = Math.min(headingLevelArray.length, level);
            if (headingLevelArray.length>=level){
                return headingLevelArray[level-1];
            }
            while (headingLevelArray.length<level){
                let lastIndex = headingLevelArray.length-1;
                let headArray = headingLevelArray[lastIndex];
                let newHeadArray = {
                    headArray:[],
                    lastIndex:0
                };
                headArray.headArray.push({
                    list: newHeadArray
                });
                headingLevelArray.push(newHeadArray);
            }
            return headingLevelArray[level-1];
        },
        createAnchorIdByHeadingLevelArrayAndLevel(headingLevelArray,level){
            let anchorId = 'chapter';
            for (let i=1;i<=level;i++){
                let headArray = headingLevelArray[i-1];
                let index = headArray.lastIndex;
                if (i===level){
                    /*
                    * Добавляем индекс так как вставляем новое значение*/
                    index++;
                }
                anchorId += '-'+index;
            }
            return anchorId;
        },
        initMd() {
            this.md = window.markdownit({
                highlight: function (str, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(str, { language: lang }).value;
                        } catch (__) {}
                    }
                    return '';
                }
            });

            let headingLevelArray = [this.headingList];

            this.md.core.ruler.push("anchor", state => {
                let tokens = state.tokens;
                for (let i = 0; i<tokens.length; i++){
                    if (tokens[i].type !== 'heading_open'){
                        continue;
                    }
                    let headContent = tokens[i+1].content;
                    let tag = tokens[i].tag;
                    let level = this.parseHeadLevelByTag(tag);
                    let headArray = this.configureHeadingLevelArrayAndGetHeadArrayByLevel(headingLevelArray,level);
                    let anchorId = this.createAnchorIdByHeadingLevelArrayAndLevel(headingLevelArray,level);
                    tokens[i].attrs ??= [];
                    tokens[i].attrs.push(["id",anchorId]);
                    let href = "#"+anchorId;

                    headArray.headArray.push({
                        tag:tag,
                        text:headContent,
                        href:href
                    });
                    headArray.lastIndex += 1;

                    let tokenOpen = new state.Token('link_open','a',1);
                    tokenOpen.attrs = [['href',href],['class','heading-link']];

                    let tokenText = new state.Token('text','',0);
                    tokenText.content = headContent;

                    let tokenClose = new state.Token('link_close','a',-1);

                    tokens[i+1].children = [
                        tokenOpen,
                        tokenText,
                        tokenClose
                    ];
                }
            });
        },
        isHostOwnInHref(href){
            if (href===undefined || href===null){
                return false;
            }
            let hrefUrl = new URL(href,document.baseURI);
            return window.location.host===hrefUrl.host;
        },
        checkByOnlyOwnHostInHref(href){
            if (!this.onlyOwnHostInHref){
                return true;
            }
            return this.isHostOwnInHref(href);
        },
        parseHrefInWindowLocation() {
            const url = new URL(window.location);
            const searchParams = url.searchParams;
            return searchParams.get('href');
        },
        fetchMarkdown(){
            if (this.markdownText!==null){
                this.updateMarkdown(this.markdownText);
            } else if (this.href!==null){
                if (!this.checkByOnlyOwnHostInHref(this.href)){
                    return;
                }
                this.fetchMarkdownByHref(this.href);
            } else if (this.useHrefInLocation){
                let href = this.parseHrefInWindowLocation();
                if (!this.checkByOnlyOwnHostInHref(href)){
                    return;
                }
                if (href!==null){
                    this.fetchMarkdownByHref(href);
                }
            }
        }
    },
    mounted() {
        this.initMd();
        this.fetchMarkdown();
    },
    template: `
   <div style="position: fixed; top: 0px; left: 0px; width: 400px; z-index: 980" v-show="showTableOfContents">
            <div class="uk-card uk-card-default uk-card-body" style="margin: 16px;width: 400px; ">
                <h3 class="uk-card-title">Оглавление</h3>
                <ul class="uk-nav uk-nav-default inactive-item" uk-scrollspy-nav="closest: li; scroll: true; cls: active-item">
                    <li v-for="head1 in headingList.headArray">
                        <a :href="head1.href" v-if="head1.text!==undefined">{{ head1.text }}</a>
                        <ul class="uk-nav-sub" style="padding-top: 0; padding-bottom: 0; padding-left: 5px" v-if="head1.list!==undefined">
                            <li v-for="head2 in head1.list.headArray">
                                <a :href="head2.href" v-if="head2.text!==undefined">{{ head2.text }}</a>
                                <ul v-if="head2.list!==undefined">
                                    <li v-for="head3 in head2.list.headArray">
                                        <a :href="head3.href" v-if="head3.text!==undefined">{{ head3.text }}</a>
                                        <ul v-if="head3.list!==undefined">
                                            <li v-for="head4 in head3.list.headArray">
                                                <a :href="head4.href" v-if="head4.text!==undefined">{{ head4.text }}</a>
                                                <ul v-if="head4.list!==undefined">
                                                    <li v-for="head5 in head4.list.headArray">
                                                        <a :href="head5.href" v-if="head5.text!==undefined">{{ head5.text }}</a>
                                                        <ul v-if="head5.list!==undefined">
                                                            <li v-for="head6 in head5.list.headArray">
                                                                <a :href="head6.href" v-if="head6.text!==undefined">{{ head6.text }}</a>
                                                            </li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
        <div style="background-color: #CFD8DC; top: 0px; position: absolute; width: 100%; min-height: 100%">
            <div class="uk-card uk-card-default uk-card-body" v-html="html" style="margin-left: 436px; top: 0px; margin-top: 16px; margin-bottom: 16px; width: 50%"></div>
        </div>
    
`
}