<?php

namespace App\Services;

class SupportAutoReplyService
{
    public function buildReply(string $incomingMessage): ?string
    {
        $text = mb_strtolower(trim($incomingMessage));

        if ($text === '') {
            return null;
        }

        if ($this->containsAny($text, ['hello', 'hi', 'mingalar', 'မင်္ဂလာ'])) {
            return 'မင်္ဂလာပါ။ Support team ထံ message ရောက်ရှိပြီးပါပြီ။ မကြာခင် ပြန်လည်ကူညီပေးပါမယ်။';
        }

        if ($this->containsAny($text, ['order', 'အော်ဒါ', 'checkout', 'confirm'])) {
            return 'Order ပြဿနာအတွက် order number ကို ပို့ပေးပါ။ Team က status စစ်ပြီး ချက်ချင်းပြန်ဖြေပါမယ်။';
        }

        if ($this->containsAny($text, ['payment', 'ငွေချေ', 'slip', 'ပေးချေ'])) {
            return 'Payment ကိစ္စအတွက် screenshot/slip တင်ထားပြီးသားလား စစ်ပေးပါ။ မတွေ့သေးရင် ထပ်တင်ပြီး အော်ဒါနံပါတ်ပို့ပေးပါ။';
        }

        if ($this->containsAny($text, ['delivery', 'shipping', 'ပို့', 'ရောက်'])) {
            return 'Delivery status ကို staff ကစစ်ဆေးနေပါတယ်။ Tracking/phone အချက်အလက်ကို ခဏနေရင် ပြန်ပေးပါမယ်။';
        }

        if ($this->containsAny($text, ['refund', 'return', 'cancel', 'ပြန်', 'ဖျက်'])) {
            return 'Return/Cancel တောင်းဆိုမှုကို လက်ခံထားပါတယ်။ အော်ဒါနံပါတ်နဲ့ အကြောင်းရင်းကို ထပ်ပို့ပါက မြန်မြန်ဆန်ဆန်လုပ်ဆောင်ပေးပါမယ်။';
        }

        return 'Message လက်ခံပြီးပါပြီ။ တာဝန်ရှိသူက မကြာခင် ပြန်လည်ဖြေကြားပေးပါမယ်။';
    }

    private function containsAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if ($needle !== '' && str_contains($haystack, $needle)) {
                return true;
            }
        }

        return false;
    }
}
