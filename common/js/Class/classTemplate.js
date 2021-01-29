//=========================================
// テンプレートのクラス
//=========================================
// const ExceptionServerError      = false;
class Template {
    constructor() {}
    //=========================================
    // テンプレートの共通処理
    // 戻り値
    // DOM  ：生成したDOMを返す
    //=========================================
    set(useTemplate, // 使用するテンプレート
        setJsonValue // セットする値（JSONデータ）
    ) {
        const $htmlDom = $(useTemplate).clone();
        for (let i in setJsonValue) {
            $(setJsonValue[i].selecter, $htmlDom)
                .html(setJsonValue[i].html)
                .val(setJsonValue[i].val)
                .addClass(setJsonValue[i].addClass)
                .attr('id', setJsonValue[i].addId)
                .attr('for', setJsonValue[i].addFor)
                .attr('style', setJsonValue[i].style);
        }
        return $htmlDom;
    }
}