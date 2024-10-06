/** @odoo-module **/
import { registerInstancePatchModel, registerFieldPatchModel } from "@mail/model/model_core";

import { attr } from "@mail/model/model_field";

registerFieldPatchModel("mail.attachment", "acrux_field", {
    isAcrux: attr({
        default: !1
    })
}), registerInstancePatchModel("mail.attachment", "acrux_linked", {
    _computeIsEditable() {
        let val = !1;
        return val = this.isAcrux ? !this.attachmentLists || !this.attachmentLists.length || this.attachmentLists[0].acruxMessageId <= 0 : this._super(), 
        val;
    }
});