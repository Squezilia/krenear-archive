<template>
    <Popup :title="`Delete ${user.username}/${selectedDeployment.name}`" v-model="PopupState">
        <div class=" popup-content">
            <div class="deployment">
                <figure class="s">
                    <img :src="`/images/${selectedDeployment.configuration}.jpg`" alt="app-icon">
                </figure>
                <div class="deployment-name">
                    <span class="name">{{ selectedDeployment.name }}</span>
                    <span class="app-name">{{ selectedDeployment.configuration }}</span>
                </div>
            </div>
            <div class="confirm">
                <span>This process is unreversable. Are you sure you want to delete this deployment?</span>
                <span>To confirm, type "{{ user.username }}/{{ selectedDeployment.name }}" in the box below</span>
                <Input style="display: block;" :placeholder="`${user.username}/${selectedDeployment.name}`" v-model="PopupDeleteConfirmInputValue" />
            </div>
            <div class="button">
                <Button ref="PopupButton" @click="deleteDeployment()">Delete this deployment</Button>
            </div>
        </div>
    </Popup>

    <h2>Danger Zone!!</h2>
    <div class="settings">
        <div class="setting">
            <div class="info">
                <h5>Delete Deployment</h5>
                <p>I suppose you know what happens if you delete Deployment?</p>
            </div>
            <div class="action">
                <Button icon="solar:trash-bin-minimalistic-bold" @click="deleteDeployment()">Delete Deployment</Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import createProtectedApiInterface from '../api/protected';
import Button from '../components/input/Button.vue';
import Input from '../components/input/Input.vue';
import Popup from '../components/view/Popup.vue';
import { selectedDeploymentStore, userStore } from '../pinia';
import router from '../router';
import workerIntervalPromise from '../api/workerIntervalPromise';

const selectedDeployment = selectedDeploymentStore();
const user = userStore();

const protectedApiInterface = createProtectedApiInterface();

const PopupState = ref<boolean>(false);

const PopupDeleteConfirmInputValue = ref<string>('');
const PopupDeleteConfirmInputError = ref<string>('');

const PopupButton = ref<{ button: HTMLButtonElement | null }>({ button: null })

async function deleteDeployment() {
    PopupDeleteConfirmInputError.value = "";

    if (!PopupState.value) return PopupState.value = true;
    PopupButton.value.button!.disabled = true;

    if (PopupDeleteConfirmInputValue.value != `${user.username}/${selectedDeployment.name}`) return PopupDeleteConfirmInputError.value = "Invalid confirmation";

    const response = await protectedApiInterface({
        method: 'DELETE',
        url: 'deployment/delete',
        data: {
            deploymentId: selectedDeployment.id
        }
    }).catch((err) => {
        PopupButton.value.button!.disabled = false;
        if (err.response) return alert(err.response.data.reason);
        alert('Something went wrong, please try again later.');
    })

    if (!response) return;

    const workerResult = await workerIntervalPromise(response.data.workerId);

    if (workerResult.status == "success") router.push('/deployments');
    if (workerResult.status == "error") {
        PopupButton.value.button!.disabled = false;
        alert('Something went wrong, please try again later.');
    }
}
</script>

<style lang="scss" scoped>
h2 {
    margin-top: 1rem;
}

.settings {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 1px solid #a16868;
    border-radius: 1rem;
    margin-top: 1rem;
    flex-direction: column;
    gap: 2rem;

    .setting {
        display: flex;
        position: relative;
        width: 100%;
        align-items: center;

        .info {
            max-width: 75%;

            h5 {
                margin-bottom: .25rem;
            }

            p {
                color: #444;
            }
        }

        .action {
            margin-left: auto;
        }
    }
}

.deployment {
    display: flex;
    align-items: center;
    gap: .55rem;
    // background: #fff;
    padding: 1rem;
    border-radius: 1rem;

    .deployment-name {
        display: flex;
        flex-direction: column;
        margin-top: -.25rem;

        .app-name {
            font-size: .85rem;
            opacity: .7;
        }
    }
}

.popup-content {
    .confirm {
        border-top: 1px solid #bababa;
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