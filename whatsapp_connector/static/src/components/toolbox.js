/** @odoo-module **/
import { link } from "@mail/model/model_field_command";

import { registerMessagingComponent } from "@mail/utils/messaging_component";

const {Component: Component} = owl, {useRef: useRef, useState: useState} = owl.hooks;

export class ToolBoxComponent extends Component {
    constructor(...args) {
        super(...args), this.attachment = useState({
            value: null
        }), this._parent_widget = this.props.parent_widget, this._fileUploaderRef = useRef("fileUploader"), 
        this.onlyUpload = !1;
    }
    get attachments() {
        let out = [];
        return this.attachment.value && out.push(this.attachment.value.localId), out;
    }
    get newAttachmentExtraData() {
        return {};
    }
    openBrowserFileUploader() {
        this._fileUploaderRef.comp.openBrowserFileUploader(), this._parent_widget.$input.focus(), 
        this.onlyUpload = !1;
    }
    _onAttachmentCreated(ev) {
        const attachment = ev.detail.attachment;
        if (!this.onlyUpload) {
            const attch_list = this.messaging.models["mail.attachment_list"].insert({
                isAcrux: !0,
                acruxMessageId: 0
            });
            attachment.update({
                attachmentLists: link(attch_list)
            }), this.attachment.value = attachment, this._parent_widget.enableDisplabeAttachBtn();
        }
        this.createdResolve && this.createdResolve(attachment);
    }
    _onAttachmentRemoved(_ev) {
        this.attachment.value = null, this._parent_widget.enableDisplabeAttachBtn();
    }
    async uploadFile(ev, onlyUpload) {
        this.onlyUpload = onlyUpload;
        const prom = new Promise((resolve => this.createdResolve = resolve));
        await this._fileUploaderRef.comp._onChangeAttachment(ev);
        return await prom;
    }
}

Object.assign(ToolBoxComponent, {
    props: {
        parent_widget: Object
    },
    template: "acrux_chat_toolbox_component"
}), registerMessagingComponent(ToolBoxComponent);