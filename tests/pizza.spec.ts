import { test, expect } from 'playwright-test-coverage';
import {randomText} from './testUtils';

test('not found page', async ({ page }) => {
  await page.goto('/notfound');
  await expect(page.getByRole('heading')).toContainText('Oops');
});

test('docs page', async ({ page }) => {
  await page.goto('/docs');
  await expect(page.getByRole('main')).toContainText('JWT Pizza API');
});

test('about page', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('main')).toContainText('The secret sauce');
});

test('login with diner dashboard', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    if(route.request().method() == 'PUT') {
      expect(route.request().postDataJSON()).toMatchObject({"email":"a@jwt.org","password":"a"});
      await route.fulfill({ json: {
        "user": {
            "id": 1,
            "name": "a",
            "email": "a@jwt.org",
            "roles": [
                {
                    "role": "admin"
                },
                {
                    "objectId": 26,
                    "role": "franchisee"
                }
            ]
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6ImEiLCJlbWFpbCI6ImFAand0Lm9yZyIsInJvbGVzIjpbeyJyb2xlIjoiYWRtaW4ifV0sImlhdCI6MTc0MDAxNTM2MX0.WzvVM5_9ry2NeUGVQzhWPbm3dk1T-AWibnyDR_TJ8PA"
    } });
    }
    else if(route.request().method() == 'DELETE') {
      await route.fulfill({ json: {"message":"logout successful"} })
    }
  });

  await page.route('*/**/api/order', async (route) => {
    if(route.request().method() == 'GET') {
      await route.fulfill({ json: {
        "dinerId": 1,
        "orders": [
            {
                "id": 3,
                "franchiseId": 2,
                "storeId": 1,
                "date": "2025-02-20T04:09:39.000Z",
                "items": [
                    {
                        "id": 3,
                        "menuId": 1,
                        "description": "mndm3",
                        "price": 0.0001
                    }
                ]
            }
        ],
        "page": 1
    } });
    }
  });

  await page.route('*/**/api/franchise', async (route) => {
    if(route.request().method() == 'GET') {
      await route.fulfill({ json: [] });
    }
  });

  // Log into admin and access diner dashboard
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.org');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout', {timeout: 5000});
  await page.getByRole('link', { name: 'a', exact: true }).click();
  await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');

  // Check if orders are present
  await expect(page.locator('tbody')).toContainText('3');
  await page.getByRole('cell', { name: '₿' }).click();
  await page.getByRole('cell', { name: '-02-20T04:09:39.000Z' }).click();
});

test('history page', async ({ page }) => {
  await page.goto('/history');
  await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
});

test('create franchise from admin and add store', async ({ page }) => {
  const franchiseEmail = `fr${randomText(6)}@jwt.org`;
  const franchiseName = `Franchise ${randomText(6)}`;
  const franchiseeName = `Franchisee ${randomText(6)}`;
  const storeName = `Store ${randomText(6)}`;

  await page.route('*/**/api/auth', async (route) => {
    if(route.request().method() == 'POST') {
      expect(route.request().postDataJSON()).toMatchObject({"name":franchiseeName,"email":franchiseEmail,"password":"a"});
      await route.fulfill({ json: {
        "user": {
            "name": franchiseeName,
            "email": franchiseEmail,
            "roles": [
                {
                    "role": "diner"
                }
            ],
            "id": 10
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNoaXNlZSBqbW12aWgiLCJlbWFpbCI6ImZycHdmaWg1QGp3dC5vcmciLCJyb2xlcyI6W3sicm9sZSI6ImRpbmVyIn1dLCJpZCI6MTAsImlhdCI6MTc0MDAxNTgwM30.y9a6Omdp1S6hHPtrTqlI4COlu5ycLdflZZ3MypAGvS4"
      } });
    }
    else if(route.request().method() == 'DELETE') {
      route.fulfill({ json: {"message":"logout successful"} })
    }
  });

  await page.goto('/');

  // Create franchise user
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill(franchiseeName);
  await page.getByRole('textbox', { name: 'Email address' }).fill(franchiseEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout', {timeout: 5000});
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Login');

  await page.route('*/**/api/auth', async (route) => {
    if(route.request().method() == 'PUT') {
      expect(route.request().postDataJSON()).toMatchObject({"email":"a@jwt.org","password":"a"});
      await route.fulfill({ json: {
        "user": {
            "id": 1,
            "name": "a",
            "email": "a@jwt.org",
            "roles": [
                {
                    "role": "admin"
                }
            ]
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6ImEiLCJlbWFpbCI6ImFAand0Lm9yZyIsInJvbGVzIjpbeyJyb2xlIjoiYWRtaW4ifV0sImlhdCI6MTc0MDAxNTM2MX0.WzvVM5_9ry2NeUGVQzhWPbm3dk1T-AWibnyDR_TJ8PA"
    } });
    }
    else if(route.request().method() == 'DELETE') {
      await route.fulfill({ json: {"message":"logout successful"} })
    }
  });

  await page.route('*/**/api/franchise', async (route) => {
    if(route.request().method() == 'GET') {
      await route.fulfill({ json: [] });
    }
  });

  // Log into admin and add franchise
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.org');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
  await expect(page.locator('#navbar-dark')).toContainText('Admin');
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();

  await page.route('*/**/api/franchise', async (route) => {
    if(route.request().method() == 'GET') {
      await route.fulfill({ json: [
        {
          "id": 26,
          "name": franchiseName,
          "admins": [
              {
                  "id": 25,
                  "name": franchiseeName,
                  "email": franchiseEmail
              }
          ],
          "stores": []
      }
      ] });
    }
    else if(route.request().method() == 'POST') {
      expect(route.request().postDataJSON()).toMatchObject({
        "stores": [],
        "id": "",
        "name": franchiseName,
        "admins": [
          {
            "email": franchiseEmail,
          }
        ]
      });
      await route.fulfill({ json: {
        "stores": [],
        "id": 26,
        "name": franchiseName,
        "admins": [
            {
                "email": franchiseEmail,
                "id": 25,
                "name": franchiseeName
            }
        ]
    } })
    }
  });

  await page.getByRole('textbox', { name: 'franchise name' }).fill(franchiseName);
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill(franchiseEmail);
  await page.getByRole('button', { name: 'Create' }).click();

  // Ensure franchise was created
  await expect(page.getByRole('cell', { name: franchiseName })).toBeVisible();
  await expect(page.getByRole('cell', { name: franchiseeName })).toBeVisible();

  // Log back into franchise user
  await page.route('*/**/api/auth', async (route) => {
    if(route.request().method() == 'PUT') {
      expect(route.request().postDataJSON()).toMatchObject({
        "email": franchiseEmail,
        "password": "a"
      });
      await route.fulfill({ json: {
        "user": {
            "id": 25,
            "name": franchiseeName,
            "email": franchiseEmail,
            "roles": [
                {
                    "role": "diner"
                },
                {
                    "objectId": 26,
                    "role": "franchisee"
                }
            ]
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjUsIm5hbWUiOiJGcmFuY2hpc2VlIHgyaXoxciIsImVtYWlsIjoiZnJudDlnOXFAand0Lm9yZyIsInJvbGVzIjpbeyJyb2xlIjoiZGluZXIifSx7Im9iamVjdElkIjoyNiwicm9sZSI6ImZyYW5jaGlzZWUifV0sImlhdCI6MTc0MDAxNTM2MX0.pLxcJEolG1HamqvMkOBjfVUg0USrrLhlnCXigkKvJgE"
    } });
    }
    else if(route.request().method() == 'DELETE') {
      await route.fulfill({ json: {"message":"logout successful"} })
    }
  });

  await page.route('*/**/api/franchise/25', async (route) => {
    if(route.request().method() == 'GET') {
      await route.fulfill({ json: [
        {
            "id": 26,
            "name": franchiseName,
            "admins": [
                {
                    "id": 25,
                    "name": franchiseeName,
                    "email": franchiseEmail
                }
            ],
            "stores": []
        }
    ] });
    }
  });

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(franchiseEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
  await expect(page.locator('#navbar-dark')).toContainText('Franchise');

  // Ensure franchise dashboard is active
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();

  // Add store
  await page.route('*/**/api/franchise/26/store', async (route) => {
    if(route.request().method() == 'POST') {
      expect(route.request().postDataJSON()).toMatchObject({"id":"","name":storeName});
      await route.fulfill({ json: {"id":11,"franchiseId":26,"name":storeName} });
    }
  });

  await page.route('*/**/api/franchise/25', async (route) => {
    if(route.request().method() == 'GET') {
      await route.fulfill({ json: [
        {
            "id": 26,
            "name": franchiseName,
            "admins": [
                {
                    "id": 25,
                    "name": franchiseeName,
                    "email": franchiseEmail
                }
            ],
            "stores": [
              {
                  "id": 11,
                  "name": storeName,
                  "totalRevenue": 0
              }
          ]
        }
    ] });
    }
  });

  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill(storeName);
  await page.getByRole('button', { name: 'Create' }).click();

  // Ensure store was created
  await expect(page.getByRole('cell', { name: storeName })).toBeVisible();

  // Delete store
  await page.getByRole('button', { name: 'Close' }).click();

  await page.route('*/**/api/franchise/26/store/11', async (route) => {
    if(route.request().method() == 'DELETE') {
      await route.fulfill({ json: {"message":"store deleted"} });
    }
  });

  await page.route('*/**/api/franchise/25', async (route) => {
    if(route.request().method() == 'GET') {
      await route.fulfill({ json: [
        {
            "id": 26,
            "name": franchiseName,
            "admins": [
                {
                    "id": 25,
                    "name": franchiseeName,
                    "email": franchiseEmail
                }
            ],
            "stores": []
        }
    ] });
    }
  });

  await page.getByRole('button', { name: 'Close' }).click();

  // Log back in as admin
  await page.route('*/**/api/auth', async (route) => {
    if(route.request().method() == 'PUT') {
      expect(route.request().postDataJSON()).toMatchObject({"email":"a@jwt.org","password":"a"});
      await route.fulfill({ json: {
        "user": {
            "id": 1,
            "name": "a",
            "email": "a@jwt.org",
            "roles": [
                {
                    "role": "admin"
                }
            ]
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6ImEiLCJlbWFpbCI6ImFAand0Lm9yZyIsInJvbGVzIjpbeyJyb2xlIjoiYWRtaW4ifV0sImlhdCI6MTc0MDAxNTM2MX0.WzvVM5_9ry2NeUGVQzhWPbm3dk1T-AWibnyDR_TJ8PA"
    } });
    }
    else if(route.request().method() == 'DELETE') {
      await route.fulfill({ json: {"message":"logout successful"} })
    }
  });

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.org');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Admin');

  // Delete franchise
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('row', { name: `${franchiseName} Franchisee` }).getByRole('button').click();

  await page.route('*/**/api/franchise/25', async (route) => {
    if(route.request().method() == 'GET') {
      await route.fulfill({ json: [] });
    }
  });

  await page.route('*/**/api/franchise/26', async (route) => {
    if(route.request().method() == 'DELETE') {
      await route.fulfill({ json: {"message":"franchise deleted"} });
    }
  });
  
  await page.getByRole('button', { name: 'Close' }).click();
});

test('purchase with login', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();

  // Verify pizza
  await page.getByRole('button', { name: 'Verify' }).click();
  const jwtVerifyText : string = (await page.locator('h3').textContent())!;
  expect(['valid', 'invalid'].some(text => jwtVerifyText.includes(text))).toBeTruthy();
  await page.getByRole('button', { name: 'Close' }).click();

  // Order more path
  await page.getByRole('button', { name: 'Order more' }).click();
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
});