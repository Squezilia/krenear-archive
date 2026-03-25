<script setup lang="ts">
import Button from '../components/input/Button.vue';
import { selectedDeploymentStore } from '../pinia';
import router from '../router';

const selectedDeployment = selectedDeploymentStore();
</script>

<template>
    <div class="container">
        <h1>We cannot provide this service 😭</h1>
        <p>We are currently working hard on this service and plan to make it available as soon as possible. So please
            stay
            tuned in the meantime.</p>
        <Button icon="solar:forward-bold" icon-position="right"
            @click="router.push({ path: `/deployment/${selectedDeployment.id}/` })">
            Back to Dashboard
        </Button>
    </div>
</template>

<style lang="scss" scoped>
.container {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    p {
        max-width: 800px;
        text-align: center;
        color: #444444;
    }
}
</style>