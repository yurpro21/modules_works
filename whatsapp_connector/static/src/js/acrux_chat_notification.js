/** @odoo-module **/
import { registry } from "@web/core/registry";

import { ActionDialog } from "@web/webclient/actions/action_dialog";

const superSetup = ActionDialog.prototype.setup;

var currentAction = {}, notifactions_hash = new Map, legacyEnv = {}, actionService = {};

ActionDialog.prototype.setup = function() {
    return currentAction = this, superSetup.apply(this, arguments);
};

export const processNotification = {
    process: function(data) {
        let msg = null;
        data.forEach((row => {
            "new_messages" === row.type ? msg = this.processNewMessage({
                new_messages: row.payload
            }) : "opt_in" === row.type ? this.processOptIn({
                opt_in: row.payload
            }) : "error_messages" === row.type && this.processErrorMessage({
                error_messages: row.payload
            });
        })), msg && (msg.messages && msg.messages.length && "text" == msg.messages[0].ttype ? legacyEnv.services.bus_service.sendNotification({
            title: legacyEnv._t("New Message from ") + msg.name,
            message: msg.messages[0].text
        }) : legacyEnv.services.bus_service.sendNotification({
            title: legacyEnv._t("New Message from ") + msg.name,
            message: ""
        }));
    },
    processNewMessage: function(row) {
        row.new_messages.forEach((conv => {
            conv.messages ? conv.messages = conv.messages.filter((msg => !msg.from_me)) : conv.messages = [];
        }));
        let msg = row.new_messages.find((conv => "all" == conv.desk_notify && conv.messages.length));
        return msg || (msg = row.new_messages.find((conv => "mines" == conv.desk_notify && conv.agent_id && conv.agent_id[0] == legacyEnv.session.uid && conv.messages.length))), 
        msg;
    },
    processOptIn: function(row) {
        const notify = {
            type: row.opt_in.opt_in ? "success" : "warning",
            title: legacyEnv._t("Opt-in update"),
            message: row.opt_in.name + " " + (row.opt_in.opt_in ? legacyEnv._t("activate") : legacyEnv._t("deactivate")) + " opt-in.",
            sticky: !0
        };
        if (legacyEnv.services.bus_service.sendNotification(notify), actionService?.currentController) {
            const state = actionService.currentController.getLocalState();
            if ("acrux.chat.conversation" === actionService.currentController.action.res_model && state.__legacy_widget__.reload().catch((() => {})), 
            currentAction?.el) {
                const styles = window.getComputedStyle(currentAction.el);
                if ("none" !== styles.display && "hidden" !== styles.visibility && currentAction.el.checkVisibility() && "acrux.chat.message.wizard" === currentAction.props.actionProps.resModel && currentAction.isLegacy) {
                    const widget = currentAction.actionRef.comp.componentRef.comp.controllerRef.comp.widget, record = widget.model.get(widget.handle, {
                        env: !1
                    });
                    record?.data?.conversation_id?.data?.id === row.opt_in.conv && widget.reload().catch((() => {}));
                }
            }
        }
    },
    processErrorMessage: function(row) {
        const msgList = [];
        for (const conv of row.error_messages) for (const msg of conv.messages) if (msg.user_id[0] === legacyEnv.session.uid) {
            const newMsg = Object.assign({}, msg);
            newMsg.name = conv.name, newMsg.number = conv.number_format, msgList.push(newMsg);
        }
        for (const msg of msgList) {
            let complement = "";
            msg.text && "" !== msg.text && (complement += legacyEnv._t("<br> Message: ") + msg.text);
            const notify = {
                type: "danger",
                title: legacyEnv._t("Message with error in <br>") + `${msg.name} (${msg.number})`,
                message: legacyEnv._t("Error: ") + msg.error_msg + complement,
                sticky: !0
            };
            legacyEnv.services.bus_service.sendNotification(notify);
        }
    }
};

function isChatroomTab() {
    let out = !1;
    const currentController = actionService.currentController;
    return currentController && (out = currentController.action.tag ? "acrux.chat.conversation_tag" === currentController.action.tag : !!currentController.acrux_comp), 
    out;
}

function onNotifaction(notifications) {
    var data = notifications;
    if (data && data.length) {
        let json = JSON.stringify(data);
        isChatroomTab() ? legacyEnv.services.local_storage.setItem("chatroom_notification", json) : notifactions_hash.set(json, setTimeout((() => {
            processNotification.process(data), notifactions_hash.delete(json);
        }), 50));
    }
}

function onStorage(event) {
    if ("chatroom_notification" === event.key) {
        const value = JSON.parse(event.newValue);
        notifactions_hash.has(value) && (clearTimeout(notifactions_hash.get(value)), notifactions_hash.delete(value));
    }
}

export const chatroomNotificationService = {
    dependencies: [ "action" ],
    start(env, {action: action}) {
        legacyEnv = owl.Component.env, actionService = action, env.bus.on("WEB_CLIENT_READY", null, (async () => {
            legacyEnv.services.bus_service.onNotification(this, onNotifaction), $(window).on("storage", (e => {
                var key = e.originalEvent.key, newValue = e.originalEvent.newValue;
                try {
                    JSON.parse(newValue), onStorage({
                        key: key,
                        newValue: newValue
                    });
                } catch (error) {}
            })), legacyEnv.services.bus_service.startPolling();
        }));
    }
};

registry.category("services").add("chatroomNotification", chatroomNotificationService);