<template>
    <Popup title="Thanks for using Krenear!!" v-model="ThanksPopupVisiblity">
        <div class="popup-content">
            <div class="confirm">
                <p>Thank you for using the free 1-week test version of Krenear. We would be very happy if you could tell
                    us
                    about your experience during your use.</p>
            </div>
            <div class="button">
                <Button @click="ThanksPopupVisiblity = false">Roger that!!</Button>
            </div>
        </div>

    </Popup>
    <div class="top-text" direction="left" scrollamount="18" behavior="scroll"><span>YOURE USING AN UNCOMPLETED
            PRODUCT</span>

        <span>IF
            YOU SEE ANY ERRORS PLEASE PROVIDE
            TO US</span>
    </div>
    <div class="ui-column sidebar" :is-auth="GetIsAuthPage(router.currentRoute.value.path)">
        <Sidebar />
    </div>
    <div class="ui-column">
        <div class="ui-row">
            <div class="ui-wrapper">
                <RouterView />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Sidebar from './components/view/Sidebar.vue';
import router from './router';
import { configurationStore, messageStore, selectedDeploymentStore, userStore } from './pinia';
import axios from 'axios';
import Popup from './components/view/Popup.vue';
import { ref, watch } from 'vue';
import Button from './components/input/Button.vue';

function GetIsAuthPage(path: string) {
    return path == '/login' || path == '/register';
}

const ThanksPopupVisiblity = ref<boolean>(false);

const messages = messageStore();
const user = userStore();
const selectedDeployment = selectedDeploymentStore();
const configuration = configurationStore();

user.load();
selectedDeployment.load();
messages.load();

ThanksPopupVisiblity.value = messages.$state.trialMessage;

watch(ThanksPopupVisiblity, (val) => {
    messages.trialMessage = val;
    messages.save();
})

if (user.token.length < 32) router.push({ path: '/login' })

async function TestAuthorization() {
    const response = await axios({
        method: 'GET',
        baseURL: configuration.apiURL,
        url: 'auth/info',
        headers: {
            Authorization: `Bearer ${user.token}`
        }
    }).catch((error) => {
        console.log(error);
        if (!error.response) return alert('Something went wrong, please try again later');
        router.push('/login');
    })

    if (!response) return router.push('/login');
}

TestAuthorization();

// // Socket
// const socket = new WebSocket(configuration.$state.socketURL);

// socket.addEventListener('open', (ev) => {
//     console.log("CONNECTED!!!");
// });

// socket.addEventListener('message', (message) => {
//     console.log(message);
// })
</script>

<style lang="scss" scoped>
.popup-content {
    max-width: 600px;

    .confirm {
        padding: 1rem;

        span {
            display: block;
            font-size: .95rem;
            margin-bottom: .25rem;
        }
    }

    .button {
        border-top: 1px solid #bababa;
        padding: 1rem;

        button {
            width: 100%;
            justify-content: center;
        }
    }

    .input-group {
        max-width: unset;
        width: 100%;
    }
}
</style>

<style lang="scss">
.top-text {
    width: 100%;
    position: fixed;
    top: 0;
    height: 1.5rem;
    display: flex;
    align-items: center;
    background: #000;
    color: #fff;

    justify-content: space-between;
    padding: 0 1rem;

    span {
        font-weight: 900;
    }
}

#app {
    display: flex;
    min-height: 100vh;
    padding-top: 1.5rem;

    height: calc(100vh - 1.5rem);

    // min-height: 100dvh;

    .ui-column {
        min-height: 100%;
        width: 100%;

        &[is-auth="true"] {
            display: none;
        }

        &.sidebar {
            background: #f4f4f4;
            max-width: 16rem;
        }

        &:last-child {
            background: #f8f8f8;
        }
    }

    .ui-row {
        width: 100%;
        height: 100%;

        &:last-child {
            display: flex;
            justify-content: center;
            overflow: auto;
            max-height: 100vh;

            .ui-wrapper {
                width: 100%;
                max-width: 1300px;
                padding: 1rem;
            }
        }
    }
}
</style>