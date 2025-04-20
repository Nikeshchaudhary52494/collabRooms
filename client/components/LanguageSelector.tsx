'use client';

import { SupportedLanguages } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export const LanguageSelector = ({
    language,
    handleLanguageChange,
    disabled,
}: {
    language: SupportedLanguages;
    handleLanguageChange: (lang: SupportedLanguages) => void;
    disabled: boolean;
}) => {
    return (
        <Select
            value={language}
            onValueChange={handleLanguageChange}
            disabled={disabled}
        >
            <SelectTrigger id="language" className="w-[180px]">
                <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
                {(['javascript', 'python', 'java', 'c', 'cpp'] as const).map(
                    (lang) => (
                        <SelectItem key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </SelectItem>
                    )
                )}
            </SelectContent>
        </Select>
    );
};