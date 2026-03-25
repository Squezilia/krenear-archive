<template>
    <Popup v-model="PopupVisibility" title="Delete this record">
        <div class="popup-content">
            <div class="confirm">
                <span>This process is unreversable. Are you sure you want to delete this record?</span>
            </div>
            <div class="button">
                <Button @click=ConfirmDelete :disabled="PopupButtonDisabled">Delete this record</Button>
            </div>
        </div>
    </Popup>

    <h1>All that you created are here! 🙏 <span>({{ Records.length }} Items)</span></h1>
    <div class="filters">
        <div class="wrapper">
            <div class="container">
                <div :class="`filter ${SelectedSchemaFilters.includes(schema.name) ? 'filled' : ''}`"
                    v-for="schema of selectedDeployment.schemas" @click="ToggleSchemaFilter(schema.name)">
                    {{ schema.name }}
                </div>
            </div>
            <div class="container">
                <Dropdown :items="CreateDropdownItems" />
                <Input placeholder="Search in records..." icon="solar:magnifer-linear" type="search" @input="Filter()"
                    v-model="SearchValue" />
            </div>
        </div>
    </div>

    <div class="records">
        <Record v-for="record of RecordFiltered" :record="record" :recordDropdownItems="RecordDropdownItems" />
    </div>
</template>

<script setup lang="ts">
import Input from '../components/input/Input.vue';
import { selectedDeploymentStore } from '../pinia';
import { ref } from 'vue';
import { Record as RecordType } from '../types/Deployment';
import createProtectedApiInterface from '../api/protected';
import { Item } from '../types/Dropdown';
import Record from '../components/view/Record.vue';
import Popup from '../components/view/Popup.vue';
import Button from '../components/input/Button.vue';
import router from '../router';
import { watch } from 'vue';
import Dropdown from '../components/input/Dropdown.vue';

const selectedDeployment = selectedDeploymentStore();

const protectedApiInterface = createProtectedApiInterface();

const Records = ref<RecordType[]>([]);
const RecordFiltered = ref<RecordType[]>([]);

const SearchValue = ref<string>('');
const SelectedSchemaFilters = ref<string[]>([]);

const PopupVisibility = ref<boolean>(false);
const PopupButtonDisabled = ref<boolean>(false);

const SelectedRecordId = ref<string | undefined>(undefined);

const CreateDropdownItems = ref<Item[]>([
])

selectedDeployment.schemas.forEach((schema) => {
    CreateDropdownItems.value.push({
        icon: "solar:document-add-bold",
        title: `Create ${schema.name}`,
        action() {
            router.push(`/deployment/${selectedDeployment.id}/records/${schema.id}`)
        },
    })
})

const RecordDropdownItems = ref<Item[]>([
    {
        title: "Delete Record",
        icon: "solar:trash-bin-minimalistic-bold",
        async action(data) {
            if (!data) return;

            SelectedRecordId.value = data.recordId;

            if (!PopupVisibility.value) return PopupVisibility.value = true;

            const response = await protectedApiInterface({
                method: "DELETE",
                url: '/deployment/record/delete',
                data: {
                    recordId: data.recordId
                }
            });

            if (response.status == 200) GetRecords();
        }
    }
]);

async function ConfirmDelete() {
    if (!SelectedRecordId.value) return;

    PopupButtonDisabled.value = true;

    const response = await protectedApiInterface({
        method: "DELETE",
        url: '/deployment/record/delete',
        data: {
            recordId: SelectedRecordId.value
        }
    });

    if (response.status == 200) {
        SelectedRecordId.value = undefined;
        PopupVisibility.value = false;
        PopupButtonDisabled.value = false;
        GetRecords();
    }
}

async function GetRecords() {
    const deploymentRecords = await protectedApiInterface({
        method: "GET",
        url: "deployment/record/get",
        params: {
            deploymentId: selectedDeployment.id,
            schema: ""
        }
    });
    Records.value = deploymentRecords.data
}

async function Filter() {
    if (SelectedSchemaFilters.value.length == 0 && SearchValue.value.length == 0) return RecordFiltered.value = Records.value;
    RecordFiltered.value = Records.value.filter((record) => {
        let result = false;
        if (SearchValue.value.length != 0 && record.ipAdress.includes(SearchValue.value)) result = true;
        for (let [key, value] of Object.entries(record.data)) {
            if (SearchValue.value.length != 0 && value.toString().includes(SearchValue.value)) result = true;
        }
        if (SelectedSchemaFilters.value.length != 0 && SelectedSchemaFilters.value.includes(record.schema.name)) result = true;
        return result;
    });
}

async function ToggleSchemaFilter(schema: string) {
    SelectedSchemaFilters.value.includes(schema) ? SelectedSchemaFilters.value = SelectedSchemaFilters.value.filter((filter) => {
        return filter != schema;
    }) : SelectedSchemaFilters.value.push(schema);
    Filter();
}

async function Main() {
    await GetRecords();
    await Filter();
}

Main();

const interval = setInterval(() => {
    Main();
}, 5000);

router.beforeResolve((to) => {
    clearInterval(interval);
})
</script>

<style lang="scss" scoped>
h1 {
    span {
        font-size: 1rem;
    }
}

.filters {
    margin-top: 1rem;

    .wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: .5rem;

        .container {
            display: flex;
            gap: .25rem;
            flex-wrap: wrap;
            align-items: center;

            .filter {
                padding: .35rem .55rem;
                border: 1px solid #bababa;
                border-radius: .35rem;
                font-size: .9rem;

                transition: .2s ease;

                cursor: pointer;

                user-select: none;

                &:hover {
                    box-shadow: 0px 4px 10px 0px #00000015;
                }

                &.filled {
                    background: #141414;
                    color: #bebebe;
                }
            }
        }
    }
}

.popup-content {
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