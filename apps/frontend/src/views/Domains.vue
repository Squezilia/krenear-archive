<template>
    <Popup v-model=PopupVisibility :title="PopupTitle">
        <p>{{ PopupMessage }}</p>
    </Popup>

    <h1>Hello, World! This is my Deployment! 🌍</h1>

    <div class="add-domain">
        <div class="add">
            <Input placeholder="Like krenear.xyz" icon="solar:global-bold" v-model="DomainValueRef"
                :error="DomainErrorRef" />
            <Button icon="solar:add-square-bold" icon-position="right" @click="AddDomain()" :disabled="isAdding">Add
                Domain</Button>
        </div>
    </div>

    <div class="domains">
        <div class="domain">
            <div class="icon">
                <Icon icon="solar:global-bold" />
            </div>
            <div class="domain-name">
                <a class="name" :href="`http://${selectedDeployment.defaultDomain}`" target="_blank">
                    {{ selectedDeployment.defaultDomain }}
                </a>
                <span class="purpose">
                    Main
                </span>
            </div>
            <div class="controls">
                <Button icon="solar:forward-linear" icon-position="right"
                    @click="OpenLink(`http://${selectedDeployment.defaultDomain}`)">Open Domain</Button>
            </div>
        </div>
        <div class="domain" v-for="domain of selectedDeployment.domains">
            <div class="icon">
                <Icon icon="solar:global-bold" />
            </div>
            <div class="domain-name">
                <a class="name" :href="`http://${domain}`" target="_blank">
                    {{ domain }}
                </a>
                <span class="purpose">
                    Secondary
                </span>
            </div>
            <div class="controls">
                <Button icon="solar:forward-linear" icon-position="right" @click="OpenLink(`http://${domain}`)">Open
                    Domain</Button>
                <Button icon="solar:trash-bin-minimalistic-bold" type="icon" @click="RemoveDomain(domain)" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import Button from '../components/input/Button.vue';
import Input from '../components/input/Input.vue';
import { ref } from 'vue';
import { selectedDeploymentStore } from '../pinia';
import createProtectedApiInterface from '../api/protected';
import workerIntervalPromise from '../api/workerIntervalPromise';
import Popup from '../components/view/Popup.vue';

const selectedDeployment = selectedDeploymentStore();

const protectedApiInterface = createProtectedApiInterface();

const DomainValueRef = ref<string>('');
const DomainErrorRef = ref<string>("");

const isAdding = ref<boolean>(false);

const PopupVisibility = ref<boolean>(false);
const PopupTitle = ref<string>("");
const PopupMessage = ref<string>("");

function OpenLink(url: string) {
    window.open(url, '_blank');
}

async function UpdateCachedDeploymentData() {
    const updateResponse = await protectedApiInterface({
        method: 'GET',
        url: `deployment/get?deploymentId=${selectedDeployment.id}`,
        params: {
            schemas: ""
        }
    })

    selectedDeployment.update(updateResponse.data[0]);

    selectedDeployment.save();
}

async function AddDomain() {
    if (isAdding.value) return;
    DomainErrorRef.value = "";

    let pattern = /([a-z]{1,63}|\.){5}$/gm;

    if (!DomainValueRef.value.match(pattern)) return DomainErrorRef.value = "This domain isn't valid.";

    let match = DomainValueRef.value.matchAll(pattern).next();
    let parsedDomain = match.value[0];

    if (parsedDomain.length != DomainValueRef.value.length) return DomainErrorRef.value = "This domain isn't valid.";

    isAdding.value = true;

    const addResponse = await protectedApiInterface({
        method: 'POST',
        url: 'deployment/domain/add',
        data: {
            deploymentId: selectedDeployment.id,
            domain: parsedDomain
        }
    }).catch((error) => {
        if (error.response) {
            PopupTitle.value = error.response.data.error;
            PopupMessage.value = error.response.data.reason;
            PopupVisibility.value = true;
            return DomainErrorRef.value = error.response.data.error;
        }
        return DomainErrorRef.value = "Something went wrong, please try again later.";
    });

    const worker = await workerIntervalPromise(addResponse.data.workerId);

    if (worker.status != 'success') return alert('Something went wrong, please try again later.');

    DomainValueRef.value = "";

    await UpdateCachedDeploymentData();

    isAdding.value = false;
}

async function RemoveDomain(domain: string) {
    const addResponse = await protectedApiInterface({
        method: 'DELETE',
        url: 'deployment/domain/remove',
        data: {
            deploymentId: selectedDeployment.id,
            domain: domain
        }
    });

    const worker = await workerIntervalPromise(addResponse.data.workerId);

    if (worker.status != 'success') return alert('Something went wrong, please try again later.');

    await UpdateCachedDeploymentData();
}

</script>

<style lang="scss" scoped>
.add-domain {
    margin-top: 1rem;
    display: flex;

    flex-direction: column;

    .add {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
        padding: 1rem;
        border: 1px solid #bababa;
        border-radius: 1rem;
        max-width: 700px;
        width: 100%;
        justify-content: space-between;
        margin: 1rem auto 0 auto;

        .input-group {
            max-width: 300px;
            width: 100%;
        }
    }
}

.domains {
    display: flex;
    margin-top: 1rem;
    flex-direction: column;
    gap: 1rem;

    .domain {
        display: flex;

        padding: 1rem;
        border: 1px solid #bababa;

        border-radius: 1rem;

        width: 100%;

        gap: .5rem;

        align-items: center;

        max-width: 800px;
        margin: 0 auto;

        .icon {
            width: 3rem;
            height: 3rem;
            aspect-ratio: 1/1;
            border-radius: .5rem;

            background: #141414;
            color: #fff;

            display: grid;
            place-items: center;

            svg {
                font-size: 1.25rem;
            }
        }

        .domain-name {
            display: flex;
            flex-direction: column;

            a {
                color: #000;
            }

            .purpose {
                font-size: .85rem;
            }
        }

        .controls {
            display: flex;

            align-items: center;

            gap: .5rem;

            margin-left: auto;
        }
    }
}

.popup {
    p {
        padding: 1rem;
    }
}
</style>