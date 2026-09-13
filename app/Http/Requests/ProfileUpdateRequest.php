<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $rules = [
            // Basic user information
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id)
            ],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[\+]?[0-9\-\(\)\s]*$/'],
            'address' => ['nullable', 'string', 'max:1000'],
            'sector' => ['nullable', 'string', 'max:100'],
            'referral_code' => [
                'nullable',
                'string',
                'size:10',
                Rule::exists(User::class, 'referral_code'),
                Rule::notIn([(string) $this->user()->referral_code]),
            ],
            'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];

        // Add role-specific validation rules
        $currentRole = $this->user()->primary_role;
        $rules = array_merge($rules, $this->getRoleSpecificRules($currentRole));

        return $rules;
    }

    /**
     * Get role-specific validation rules
     */
    private function getRoleSpecificRules(?string $role): array
    {
        return match($role) {
            'sunday_school_teacher' => [
                'teaching_area' => ['nullable', 'string', 'max:255'],
                'class_level' => ['nullable', 'string', 'max:100'],
                'lesson_focus' => ['nullable', 'string', 'max:500'],
                'availability' => ['nullable', 'string', 'max:255'],
            ],
            default => []
        };
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Your full name is required.',
            'name.max' => 'Your name cannot exceed 255 characters.',

            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already taken.',

            'phone.regex' => 'Please enter a valid phone number.',
            'phone.max' => 'Phone number cannot exceed 20 characters.',

            'address.max' => 'Address cannot exceed 1000 characters.',
            'sector.max' => 'Sector name cannot exceed 100 characters.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $this->validatePhoneFormat($validator);
        });
    }

    /**
     * Validate phone number format
     */
    private function validatePhoneFormat(Validator $validator): void
    {
        if ($this->phone && !empty($this->phone)) {
            $phone = preg_replace('/[^0-9+]/', '', $this->phone);
            if (str_starts_with($phone, '+234') && strlen($phone) !== 14) {
                $validator->errors()->add(
                    'phone',
                    'Nigerian phone numbers should be in format +234XXXXXXXXXX'
                );
            }
        }
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Clean and format phone number
        if ($this->phone) {
            $phone = preg_replace('/[^\d+]/', '', $this->phone);
            $this->merge(['phone' => $phone]);
        }
    }
}
