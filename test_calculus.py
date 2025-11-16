import json
from app import app

def test_derivative_basic():
    client = app.test_client()
    resp = client.post('/api/calculus', json={
        'expression': 'x^3 + 3*x',
        'operation': 'derivative',
        'variable': 'x',
        'order': 1
    })
    assert resp.status_code == 200, resp.data
    data = resp.get_json()
    # Derivative should be 3*x^2 + 3 simplified as 3*x**2 + 3
    assert '3*x' in data['result'] or '3*x**2' in data['result']


def test_integral_definite():
    client = app.test_client()
    resp = client.post('/api/calculus', json={
        'expression': 'x',
        'operation': 'integral',
        'variable': 'x',
        'lower': '0',
        'upper': '2'
    })
    assert resp.status_code == 200, resp.data
    data = resp.get_json()
    assert data['definite'] is True
    # Integral of x from 0 to 2 is 2
    assert abs(data.get('numeric_approx', 0) - 2.0) < 1e-9

if __name__ == '__main__':
    # Run tests manually
    with app.app_context():
        test_derivative_basic()
        test_integral_definite()
        print('Calculus tests passed.')
