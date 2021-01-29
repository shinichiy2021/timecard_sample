//=========================================
// ビュークラス
// SPAページ遷移の共通処理
//=========================================
class viewFactory {
    constructor(url, $el, $template, mainClass) {
        this.url = url;
        this.$el = $el;
        this.$template = $template;
        this.mainClass = mainClass;
    }
}