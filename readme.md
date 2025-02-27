# Africa Payroll

Africa Payroll is a payroll processor designed to handle payroll processing for various African countries. It supports country-specific statutory and fee calculations, ensuring compliance with local regulations.

## Features

- **Multi-Country Support**: Calculate payroll for multiple African countries with country-specific statutory and fee services.
- **Statutory Calculations**: Automatically calculate taxes, pensions, and other statutory deductions.
- **Fee Services**: Calculate transaction fees based on country-specific rules.
- **Flexible Payroll Options**: Support for different payroll modes and configurations.

## Installation

To install the project, clone the repository and install the dependencies using npm:

```bash
git clone https://github.com/winninggreat/africa-payroll.git
cd africa-payroll
npm install
```

```typescript
import { PayrollBuilder } from './services/payroll.builder';
import { BuildPayrollOption } from './types/payroll.types';

// Define payroll options
const options: BuildPayrollOption = {
  organizationId: 'your-organization-id',
  employees: [/* array of employee objects */],
  month: 'January',
  year: 2023,
  currency: 'NGN',
  country: 'NG',
};

// Create a payroll builder instance
const payrollBuilder = new PayrollBuilder(options);

// Process payroll
const payroll = payrollBuilder.build();
console.log('Total Payroll Amount:', payroll.totalPayrollAmount);
```