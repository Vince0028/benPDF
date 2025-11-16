import math
from calculus_tool import derivative, integral, normalize_expression

# Basic normalization assertions
NORMALIZATION_CASES = {
    "9x**2 + 4": "9*x**2 + 4",
    "x4": "x**4",
    "6x5": "6*x**5",
    "x*(xcos(x) + 2sin(x))": "x*(x*cos*x* + 2*sin*x*)",  # NOTE: This expected output is illustrative; actual normalization may differ
}

# Derivative cases: (expr, order)
DERIV_CASES = [
    ("x4", 1),
    ("x4", 2),
    ("6x5", 1),
    ("6x5", 3),
    ("2exp(2x)", 1),
]


def test_derivatives_run():
    for expr, order in DERIV_CASES:
        res = derivative(expr, order)
        assert res.result is not None
        assert len(res.steps) >= order + 2  # normalized + each diff + simplified


def test_integral_definite():
    res = integral("x2", lower="0", upper="2")
    assert res.numeric is not None

if __name__ == '__main__':
    test_derivatives_run()
    test_integral_definite()
    print("test_calculus_tool basic tests passed")
