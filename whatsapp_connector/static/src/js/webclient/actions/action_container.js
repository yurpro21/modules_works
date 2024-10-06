/** @odoo-module **/
import { ActionContainer } from "@web/webclient/actions/action_container";

import { browser } from "@web/core/browser/browser";

const superRender = ActionContainer.prototype.render;

async function render(force = !1) {
    let out, callSuper = !1;
    try {
        if (this.info.componentProps.context && this.info.componentProps.context.is_acrux_chat_room && "inline" === this.info.componentProps.action.target) {
            this.info.Component.env.services = Object.assign({}, this.env.services, this.info.Component.env.services);
            const comp = new this.info.Component(null, this.info.componentProps), tmp = document.createElement("div");
            await comp.mount(tmp);
            const current_action = browser.sessionStorage.getItem("current_action"), url_origin = browser.location.href;
            comp.mounted(), browser.sessionStorage.setItem("current_action", current_action), 
            browser.setTimeout((() => {
                browser.history.replaceState({}, "", url_origin);
            }));
            this.env.services.action.currentController.acrux_comp = comp, out = Promise.resolve();
        } else callSuper = !0;
    } catch (err) {
        console.log(err), callSuper = !0;
    }
    return callSuper && (out = superRender.call(this, force)), out;
}

ActionContainer.prototype.render = render;