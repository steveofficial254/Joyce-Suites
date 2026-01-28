#!/usr/bin/env python3
"""
Deposit System Test Runner

Usage:
    python run_deposit_tests.py
    python run_deposit_tests.py --verbose
    python run_deposit_tests.py --class TestDepositRecordModel
    python run_deposit_tests.py --method test_deposit_record_creation
"""

import sys
import os
import subprocess
import argparse

def run_tests(verbose=False, test_class=None, test_method=None):
    """Run deposit system tests with specified options"""
    
    # Set up environment
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['PYTHONPATH'] = os.path.dirname(os.path.abspath(__file__))
    
    # Build pytest command
    cmd = ['python', '-m', 'pytest', 'tests/test_deposit.py']
    
    if verbose:
        cmd.append('-v')
    
    if test_class:
        cmd.append(f'tests/test_deposit.py::{test_class}')
    
    if test_method:
        if test_class:
            cmd[-1] += f'::{test_method}'
        else:
            cmd.append(f'tests/test_deposit.py::{test_method}')
    
    # Add coverage if available
    try:
        import pytest_cov
        cmd.extend(['--cov=models.rent_deposit', '--cov=routes.rent_deposit', '--cov=routes.admin_routes', '--cov=routes.tenant_routes'])
    except ImportError:
        print("Coverage not available. Install with: pip install pytest-cov")
    
    # Add test output formatting
    cmd.extend([
        '--tb=short',  # Short traceback format
        '--color=yes',  # Colored output
        '-x'  # Stop on first failure
    ])
    
    print("💰 Running Deposit System Tests")
    print("=" * 50)
    print(f"Command: {' '.join(cmd)}")
    print("=" * 50)
    
    try:
        result = subprocess.run(cmd, cwd=os.path.dirname(os.path.abspath(__file__)))
        return result.returncode
    except KeyboardInterrupt:
        print("\n❌ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return 1


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Run deposit system tests')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--class', '-c', dest='test_class', help='Run specific test class')
    parser.add_argument('--method', '-m', dest='test_method', help='Run specific test method')
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.test_method and not args.test_class:
        print("❌ Error: --method requires --class")
        return 1
    
    # Run tests
    exit_code = run_tests(
        verbose=args.verbose,
        test_class=args.test_class,
        test_method=args.test_method
    )
    
    if exit_code == 0:
        print("\n✅ All deposit tests passed!")
    else:
        print(f"\n❌ Tests failed with exit code {exit_code}")
    
    return exit_code


if __name__ == '__main__':
    sys.exit(main())
