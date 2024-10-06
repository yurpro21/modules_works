/** @odoo-module **/
import { registerInstancePatchModel } from "@mail/model/model_core";

registerInstancePatchModel("mail.attachment_image", "change_width", {
    _computeWidth() {
        let val;
        return val = this.attachmentList && this.attachmentList.isAcrux ? 100 : this._super(), 
        val;
    },
    _computeHeight() {
        let val;
        return val = this.attachmentList && this.attachmentList.isAcrux ? 100 : this._super(), 
        val;
    }
});