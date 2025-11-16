"""Standalone calculus helper: safe parsing, derivatives, integrals, and expression normalization.

Features:
- Converts informal input like `9x**2 + 4`, `x4`, `6x5`, `x*(xcos(x)+2sin(x))` into formal SymPy expressions.
- Safely parses using a restricted namespace (no eval of arbitrary builtins).
- Supports higher-order derivatives via repeated diff to avoid subtle caching issues.
- Supports definite and indefinite integrals.
- Returns both SymPy object, string, and LaTeX.

Normalization Rules:
1. Insert explicit `*` between a number/variable/closing parenthesis and a following variable/function (implicit multiplication).
2. Convert patterns like `x4` (variable followed by digits) into `x**4` (assumed exponent).
3. Convert patterns like `6x5` into `6*x**5` (coefficient times power).
4. Leave already explicitly multiplied forms unchanged.
5. Trim whitespace and unify consecutive spaces.

Caveats:
- Ambiguous forms like `x4` are assumed to mean exponent; if you intended `x*4` write that explicitly.
- Functions recognized: sin, cos, tan, log, exp, sqrt.

Extend recognized functions by editing ALLOWED_FUNCS.
"""
from __future__ import annotations
import re
from dataclasses import dataclass
from typing import Optional, Dict, Any
from sympy import Symbol, sin, cos, tan, log, exp, sqrt, diff, integrate, latex
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)

# Allowed functions for safety (extend as needed)
ALLOWED_FUNCS: Dict[str, Any] = {
    'sin': sin,
    'cos': cos,
    'tan': tan,
    'log': log,  # natural log
    'exp': exp,
    'sqrt': sqrt,
}

TRANSFORMS = standard_transformations + (implicit_multiplication_application,) + (convert_xor,)

EXPONENT_VAR_PATTERN = re.compile(r"([a-zA-Z])([0-9]+)")  # x4 -> x**4
COEFF_VAR_EXP_PATTERN = re.compile(r"([0-9]+)([a-zA-Z])([0-9]+)")  # 6x5 -> 6*x**5
FUNC_NAMES = list(ALLOWED_FUNCS.keys())
PROTECT_MAP = {fn: f"__{fn.upper()}__" for fn in FUNC_NAMES}

@dataclass
class CalcResult:
    expr_str: str
    sympy_expr: Any
    result: Any
    latex: str
    steps: Optional[list] = None
    numeric: Optional[float] = None


def normalize_expression(raw: str) -> str:
    """Normalize informal math to a SymPy-friendly form.

    Rules:
    - x4 -> x**4 (variable followed by digits becomes exponent)
    - 6x5 -> 6*x**5 (coefficient, variable, exponent digits)
    - Insert * between (number|x|)) and a following function name (sin|cos|tan|log|exp|sqrt)
    - Insert * between (number|)) and x (implicit multiplication)
    - Convert remaining '2x' into '2*x'
    - Leave function names intact; rely on implicit_multiplication_application for things like 2*x*exp(2*x)
    """
    s = raw.strip()
    # Variable exponent: x4 -> x**4 (only for single variable x)
    s = re.sub(r"\bx([0-9]+)\b", lambda m: f"x**{m.group(1)}", s)
    # Coefficient variable exponent: 6x5 -> 6*x**5
    s = re.sub(r"\b([0-9]+)x([0-9]+)\b", lambda m: f"{m.group(1)}*x**{m.group(2)}", s)
    # Coefficient with variable (no exponent): 9x -> 9*x (avoid if already handled)
    s = re.sub(r"\b([0-9]+)x\b", lambda m: f"{m.group(1)}*x", s)
    # Insert * between x and function when merged: xcos(x) -> x*cos(x)
    for fn in FUNC_NAMES:
        s = re.sub(rf"x{fn}\(", f"x*{fn}(", s)
    # Insert * between number or ) and function name: 2exp( -> 2*exp(
    for fn in FUNC_NAMES:
        s = re.sub(rf"([0-9)]){fn}\(", r"\1*" + fn + "(", s)
    # Insert * between number or ) and x: 2x -> 2*x, )x -> )*x
    s = re.sub(r"([0-9)])x", r"\1*x", s)
    # Collapse multiple spaces
    s = re.sub(r"\s+", " ", s)
    return s


def safe_parse(expr_string: str, var_name: str = 'x'):
    var = Symbol(var_name)
    local_dict = {var_name: var, **ALLOWED_FUNCS}
    normalized = normalize_expression(expr_string)
    try:
        parsed = parse_expr(normalized, local_dict=local_dict, transformations=TRANSFORMS, evaluate=True)
    except Exception as e:
        raise ValueError(f"Failed to parse expression '{expr_string}' (normalized '{normalized}'): {e}")
    return parsed, normalized, var


def derivative(expr_string: str, order: int = 1, var_name: str = 'x') -> CalcResult:
    if order < 1:
        raise ValueError("order must be >= 1")
    expr, normalized, var = safe_parse(expr_string, var_name)
    current = expr
    steps = [f"Normalized: {normalized}"]
    for k in range(order):
        current = diff(current, var)
        steps.append(f"After diff {k+1}: {current}")
    simplified = current.simplify()
    steps.append(f"Simplified: {simplified}")
    return CalcResult(expr_str=normalized, sympy_expr=expr, result=simplified, latex=latex(simplified), steps=steps)


def integral(expr_string: str, var_name: str = 'x', lower: Optional[str] = None, upper: Optional[str] = None) -> CalcResult:
    expr, normalized, var = safe_parse(expr_string, var_name)
    steps = [f"Normalized: {normalized}"]
    if lower is not None and upper is not None:
        # Definite integral
        parsed_lower, norm_lower, _ = safe_parse(lower, var_name)
        parsed_upper, norm_upper, _ = safe_parse(upper, var_name)
        integ = integrate(expr, (var, parsed_lower, parsed_upper))
        steps.append(f"Integrate from {norm_lower} to {norm_upper}: {integ}")
        simplified = integ.simplify()
        steps.append(f"Simplified: {simplified}")
        try:
            numeric_val = float(simplified.evalf())
        except Exception:
            numeric_val = None
        return CalcResult(expr_str=normalized, sympy_expr=expr, result=simplified, latex=latex(simplified), steps=steps, numeric=numeric_val)
    else:
        integ = integrate(expr, var)
        steps.append(f"Indefinite integral: {integ} + C")
        simplified = integ.simplify()
        steps.append(f"Simplified: {simplified} + C")
        return CalcResult(expr_str=normalized, sympy_expr=expr, result=simplified, latex=latex(simplified), steps=steps)


def _demo():
    tests = [
        ("x*(xcos(x) + 2sin(x))", 1),      # implicit mult: x*cos(x) etc
        ("9x**2 + 4", 1),                   # 9*x**2 + 4
        ("2exp(2x)log(exp(1)) + 5", 1),     # chain of functions
        ("x**3(4log(x) + 1)", 1),           # x**3*(4*log(x)+1)
        ("2x + cos(x)(-2)", 1),             # 2*x + cos(x)*(-2)
        ("x4", 2),                          # x**4 second derivative
        ("6x5", 3),                         # 6*x**5 third derivative
        ("6*x2 + 1/(2*sqrt(x))", 1),        # 6*x**2 + 1/(2*sqrt(x))
    ]
    print("Derivative Tests:\n")
    for expr, order in tests:
        try:
            res = derivative(expr, order)
            # Clean output: only LaTeX form of the final simplified derivative
            print(f"Input: {expr}\n Order: {order}\n Normalized: {res.expr_str}\n Result (LaTeX): {latex(res.result)}\n Steps:")
            for st in res.steps:
                print("  -", st)
            print("-")
        except Exception as e:
            print(f"Failed for {expr}: {e}")
    print("Integral quick checks:\n")
    for expr in ["x2", "sin(x)", "exp(2x)"]:
        try:
            indef = integral(expr)
            print(f"Indefinite {expr} -> {latex(indef.result)} + C")
            definite = integral(expr, lower="0", upper="2")
            approx = f" ≈ {definite.numeric}" if definite.numeric is not None else ""
            print(f"Definite {expr} from 0 to 2 -> {latex(definite.result)}{approx}")
        except Exception as e:
            print(f"Integral failed for {expr}: {e}")

if __name__ == '__main__':
    _demo()
