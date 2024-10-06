/** @odoo-module **/
import { FileUploader } from "@mail/components/file_uploader/file_uploader";

import { registerMessagingComponent } from "@mail/utils/messaging_component";

import framework from "web.framework";

export const geAttachmentNextTemporaryId = function() {
    let tmpId = 0;
    return () => (tmpId += 1, tmpId);
}();

export class AcruxFileUploader extends FileUploader {
    constructor(...args) {
        super(...args);
    }
    async uploadFiles(files) {
        try {
            framework.blockUI(), await super.uploadFiles(files);
        } finally {
            framework.unblockUI();
        }
    }
    async _performUpload({files: files}) {
        const uploadingAttachments = new Map;
        for (const file of files) uploadingAttachments.set(file, this.messaging.models["mail.attachment"].insert({
            filename: file.name,
            id: geAttachmentNextTemporaryId(),
            isUploading: !0,
            mimetype: file.type,
            name: file.name,
            originThread: void 0,
            isAcrux: !0
        }));
        for (const file of files) {
            const uploadingAttachment = uploadingAttachments.get(file);
            if (uploadingAttachment.exists()) try {
                const response = await this.env.browser.fetch("/web/binary/upload_attachment_chat", {
                    method: "POST",
                    body: this._createFormData({
                        file: file
                    }),
                    signal: uploadingAttachment.uploadingAbortController.signal
                }), attachmentData = await response.json();
                uploadingAttachment.exists() && uploadingAttachment.delete(), this._onAttachmentUploaded({
                    attachmentData: attachmentData
                });
            } catch (e) {
                if ("AbortError" !== e.name) throw e;
            }
        }
    }
}

Object.assign(AcruxFileUploader, {
    props: {
        attachmentLocalIds: Array,
        newAttachmentExtraData: Object
    }
}), registerMessagingComponent(AcruxFileUploader);