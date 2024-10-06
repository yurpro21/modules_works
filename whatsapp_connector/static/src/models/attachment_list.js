/** @odoo-module **/
import { registerFieldPatchModel, registerIdentifyingFieldsPatch } from "@mail/model/model_core";

import { attr } from "@mail/model/model_field";

registerFieldPatchModel("mail.attachment_list", "acrux_field", {
    isAcrux: attr({
        default: !1
    }),
    acruxMessageId: attr({})
}), registerIdentifyingFieldsPatch("mail.attachment_list", "acrux_field", (identifyingFields => {
    identifyingFields[0].push("acruxMessageId");
}));