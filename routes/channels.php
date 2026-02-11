<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('shop.{shopId}.notifications', function ($user, $shopId) {
    if ($user->hasRole('admin')) {
        return true;
    }

    return $user->hasRole('manager')
        && (int) $user->shop_id === (int) $shopId;
});
