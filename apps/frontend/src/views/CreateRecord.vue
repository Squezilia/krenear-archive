<template>
    <Popup v-model="PopupVisibility" :title="PopupTitle">
        <p class="popup-message">{{ PopupMessage }}</p>
    </Popup>

    <div class="head">
        <h1 v-if="SchemaRef">Create {{ SchemaRef.name }}</h1>
        <h1 v-else>Create Record</h1>
        <div class="controls">
            <Button default-state="calm" icon="solar:arrow-left-linear" @click="GoBack()">
                Back
            </Button>
        </div>
    </div>

    <div class="container" v-if="SchemaRef && Fields.length > 0">
        <div class="meta">
            <div class="schema">
                <div class="icon">
                    <Icon :icon="SchemaRef.icon" />
                </div>
                <div class="details">
                    <span class="name">{{ SchemaRef.name }}</span>
                    <span class="desc">{{ Fields.length }} Fields</span>
                </div>
            </div>
            <p>Fill the form and create a record for this deployment.</p>
        </div>

        <div class="form">
            <div class="fields">
                <div class="field" v-for="field of Fields" :key="field.key">
                    <span class="label">{{ field.key }}</span>

                    <Input v-if="field.type != 'boolean'" :placeholder="field.key"
                        :type="field.type == 'number' ? 'number' : 'text'" v-model="FormValues[field.key]"
                        :error="FieldErrors[field.key]" />

                    <div class="boolean" v-else>
                        <label class="checkbox">
                            <input type="checkbox" v-model="FormValues[field.key]" />
                            <span class="hint">True / False</span>
                        </label>
                        <span class="error">{{ FieldErrors[field.key] }}</span>
                    </div>
                </div>
            </div>

            <div class="actions">
                <Button icon="solar:document-add-bold" icon-position="right" @click="CreateRecord()"
                    :disabled="isCreating">
                    Create Record
                </Button>
            </div>
        </div>
    </div>

    <div class="container missing" v-else>
        <p v-if="IsLoading">Loading schema...</p>
        <p v-else>Schema not found (or has no fields).</p>
        <Button icon="solar:forward-bold" icon-position="right" @click="GoBack()">Back to Records</Button>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import { ref } from 'vue';
import Button from '../components/input/Button.vue';
import Input from '../components/input/Input.vue';
import Popup from '../components/view/Popup.vue';
import createProtectedApiInterface from '../api/protected';
import router from '../router';
import { selectedDeploymentStore } from '../pinia';
import type { Schema } from '../types/Deployment';

type FieldType = 'string' | 'number' | 'boolean' | string;
type Field = { key: string; type: FieldType };

const selectedDeployment = selectedDeploymentStore();
const protectedApiInterface = createProtectedApiInterface();

const IsLoading = ref<boolean>(true);
const isCreating = ref<boolean>(false);

const SchemaRef = ref<Schema | null>(null);
const Fields = ref<Field[]>([]);

const FormValues = ref<Record<string, any>>({});
const FieldErrors = ref<Record<string, string>>({});

const PopupVisibility = ref<boolean>(false);
const PopupTitle = ref<string>('');
const PopupMessage = ref<string>('');

function GoBack() {
    const deploymentId = router.currentRoute.value.params.deploymentId as string | undefined;
    if (!deploymentId) return router.push('/deployments');
    router.push(`/deployment/${deploymentId}/records`);
}

function parseTypes(types: string[]): Field[] {
    const fields: Field[] = [];
    for (const entry of types) {
        const [rawKey, rawType] = entry.split(':');
        const key = (rawKey || '').trim();
        const type = ((rawType || 'string').trim() as FieldType) || 'string';
        if (!key) continue;
        fields.push({ key, type });
    }
    return fields;
}

function initForm(fields: Field[]) {
    const values: Record<string, any> = {};
    const errors: Record<string, string> = {};

    fields.forEach((field) => {
        if (field.type == 'boolean') values[field.key] = false;
        else values[field.key] = '';
        errors[field.key] = '';
    });

    FormValues.value = values;
    FieldErrors.value = errors;
}

function validateForm(fields: Field[]) {
    const errors: Record<string, string> = { ...FieldErrors.value };
    let hasError = false;

    fields.forEach((field) => {
        errors[field.key] = '';
        const value = FormValues.value[field.key];

        if (field.type == 'string' && typeof value == 'string' && value.length > 255) {
            errors[field.key] = 'Max 255 characters.';
            hasError = true;
        }
    });

    FieldErrors.value = errors;
    return !hasError;
}

function buildPayload(fields: Field[]) {
    const payload: Record<string, any> = {};

    fields.forEach((field) => {
        const rawValue = FormValues.value[field.key];

        if (field.type == 'number') {
            if (rawValue === '' || rawValue === undefined || rawValue === null) return;
            const numberValue = Number(rawValue);
            if (Number.isNaN(numberValue)) return;
            payload[field.key] = numberValue;
            return;
        }

        if (field.type == 'boolean') {
            payload[field.key] = !!rawValue;
            return;
        }

        payload[field.key] = rawValue ?? '';
    });

    return payload;
}

async function LoadSchema() {
    IsLoading.value = true;

    const deploymentId = router.currentRoute.value.params.deploymentId as string | undefined;
    const schemaId = router.currentRoute.value.params.schemaId as string | undefined;

    if (!deploymentId || !schemaId) {
        IsLoading.value = false;
        PopupTitle.value = "Route Error";
        PopupMessage.value = "Missing deploymentId or schemaId.";
        PopupVisibility.value = true;
        return;
    }

    const response = await protectedApiInterface({
        method: 'GET',
        url: 'deployment/get',
        params: {
            deploymentId,
            schemas: ''
        }
    }).catch((err) => {
        if (err.response) {
            PopupTitle.value = err.response.data.error || 'Error';
            PopupMessage.value = err.response.data.reason || 'Request failed.';
            PopupVisibility.value = true;
            return;
        }
        PopupTitle.value = 'Network Error';
        PopupMessage.value = 'Something went wrong, please try again later.';
        PopupVisibility.value = true;
    });

    if (!response) {
        IsLoading.value = false;
        return;
    }

    const deployment = response.data?.[0];
    if (deployment) {
        selectedDeployment.update(deployment);
        selectedDeployment.save();
    }

    const schema = (deployment?.schemas || selectedDeployment.schemas || []).find((s: Schema) => s.id == schemaId) || null;
    SchemaRef.value = schema;

    Fields.value = schema ? parseTypes(schema.types) : [];
    if (schema) initForm(Fields.value);

    IsLoading.value = false;
}

async function CreateRecord() {
    if (isCreating.value) return;
    if (!SchemaRef.value) return;

    if (!validateForm(Fields.value)) return;

    const deploymentId = router.currentRoute.value.params.deploymentId as string | undefined;
    if (!deploymentId) return;

    isCreating.value = true;

    const payload = buildPayload(Fields.value);

    const response = await protectedApiInterface({
        method: 'POST',
        url: 'deployment/record',
        data: {
            deploymentId,
            schema: SchemaRef.value.name,
            data: payload
        }
    }).catch((err) => {
        isCreating.value = false;
        if (err.response) {
            PopupTitle.value = err.response.data.error || 'Error';
            PopupMessage.value = err.response.data.reason || 'Request failed.';
            PopupVisibility.value = true;
            return;
        }
        PopupTitle.value = 'Network Error';
        PopupMessage.value = 'Something went wrong, please try again later.';
        PopupVisibility.value = true;
    });

    if (!response) return;

    isCreating.value = false;
    GoBack();
}

LoadSchema();
</script>

<style lang="scss" scoped>
.head {
    display: flex;
    align-items: center;
    gap: 1rem;

    .controls {
        margin-left: auto;
    }
}

.container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;

    &.missing {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;

        p {
            color: #444;
        }
    }

    .meta {
        flex: 0 0 32%;
        min-width: 240px;
        height: fit-content;
        border: 1px solid #bababa;
        border-radius: 1rem;
        padding: 1rem;
        background: #fff;

        .schema {
            display: flex;
            align-items: center;
            gap: .75rem;
            margin-bottom: .75rem;

            .icon {
                width: 3rem;
                height: 3rem;
                border-radius: .75rem;
                background: #141414;
                color: #fff;
                display: grid;
                place-items: center;

                svg {
                    font-size: 1.35rem;
                }
            }

            .details {
                display: flex;
                flex-direction: column;

                .desc {
                    font-size: .85rem;
                    opacity: .7;
                }
            }
        }

        p {
            color: #444;
        }
    }

    .form {
        flex: 1 1 60%;
        border: 1px solid #bababa;
        border-radius: 1rem;
        overflow: hidden;
        background: #fff;
        min-width: 320px;

        .fields {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            padding: 1rem;

            .field {
                display: flex;
                flex-direction: column;
                gap: .35rem;
                flex: 0 0 48%;
                min-width: 220px;

                .label {
                    font-size: .85rem;
                    opacity: .8;
                    margin-left: .25rem;
                }

                .boolean {
                    display: flex;
                    flex-direction: column;
                    gap: .25rem;
                    padding: .5rem .75rem;
                    border: 1px solid #e2e2e2;
                    border-bottom: 2px solid #e2e2e2;
                    border-radius: .5rem;

                    .checkbox {
                        display: flex;
                        align-items: center;
                        gap: .5rem;

                        input {
                            width: 1.1rem;
                            height: 1.1rem;
                        }

                        .hint {
                            opacity: .75;
                            font-size: .9rem;
                        }
                    }

                    .error {
                        color: #a16868;
                        font-size: .95rem;
                    }
                }
            }
        }

        .actions {
            padding: 1rem;
            border-top: 1px solid #bababa;
            display: flex;
            justify-content: flex-end;

            button {
                justify-content: center;
            }
        }
    }
}

.popup-message {
    padding: 1rem;
}
</style>
